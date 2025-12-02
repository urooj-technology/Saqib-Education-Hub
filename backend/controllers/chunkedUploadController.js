const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const { createError } = require('../middleware/errorHandler');

// Store upload sessions in memory (in production, use Redis or database)
const uploadSessions = new Map();

/**
 * Initialize chunked upload session
 * @route POST /api/upload/init
 * @access Private
 */
const initializeUpload = async (req, res, next) => {
  try {
    const { fileName, fileSize, totalChunks, uploadId, mimeType } = req.body;

    // Validate input
    if (!fileName || !fileSize || !totalChunks) {
      return next(createError(400, 'Missing required fields: fileName, fileSize, totalChunks'));
    }

    // Generate session ID
    const sessionId = uploadId || uuidv4();

    // Create upload directory
    const uploadDir = path.join(__dirname, '..', 'uploads', 'chunks', sessionId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Store session info
    uploadSessions.set(sessionId, {
      fileName,
      fileSize,
      totalChunks,
      uploadedChunks: [],
      mimeType,
      createdAt: new Date(),
      userId: req.user?.id
    });

    logger.info(`Upload session initialized: ${sessionId} for file ${fileName}`);

    res.status(200).json({
      success: true,
      sessionId,
      message: 'Upload session initialized'
    });
  } catch (error) {
    logger.error('Error initializing upload session:', error);
    next(createError(500, 'Failed to initialize upload session'));
  }
};

/**
 * Upload a single chunk
 * @route POST /api/upload/chunk
 * @access Private
 */
const uploadChunk = async (req, res, next) => {
  try {
    const { chunkNumber, totalChunks, sessionId } = req.body;
    const chunk = req.file; // Changed from req.files?.chunk to req.file

    if (!chunk || !chunkNumber || !sessionId) {
      return next(createError(400, 'Missing required fields: chunk, chunkNumber, sessionId'));
    }

    // Validate session
    const session = uploadSessions.get(sessionId);
    if (!session) {
      return next(createError(404, 'Upload session not found'));
    }

    // Validate chunk number
    const chunkNum = parseInt(chunkNumber);
    if (chunkNum < 1 || chunkNum > totalChunks) {
      return next(createError(400, 'Invalid chunk number'));
    }

    // Move chunk to the correct location
    const chunkFileName = `chunk_${chunkNum.toString().padStart(4, '0')}`;
    const chunkDir = path.join(__dirname, '..', 'uploads', 'chunks', sessionId);
    const chunkPath = path.join(chunkDir, chunkFileName);
    
    // Create chunk directory if it doesn't exist
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }
    
    // Move the file from multer's temporary location to our chunk directory
    fs.renameSync(chunk.path, chunkPath);

    // Update session
    session.uploadedChunks.push(chunkNum);
    uploadSessions.set(sessionId, session);

    logger.info(`Chunk ${chunkNum}/${totalChunks} uploaded for session ${sessionId}`);

    res.status(200).json({
      success: true,
      chunkNumber: chunkNum,
      message: `Chunk ${chunkNum} uploaded successfully`
    });
  } catch (error) {
    logger.error('Error uploading chunk:', error);
    next(createError(500, 'Failed to upload chunk'));
  }
};

/**
 * Complete chunked upload by assembling chunks
 * @route POST /api/upload/complete
 * @access Private
 */
const completeUpload = async (req, res, next) => {
  try {
    const { sessionId, uploadedChunks, fileName, fileSize } = req.body;

    if (!sessionId || !uploadedChunks || !fileName) {
      return next(createError(400, 'Missing required fields: sessionId, uploadedChunks, fileName'));
    }

    // Validate session
    const session = uploadSessions.get(sessionId);
    if (!session) {
      return next(createError(404, 'Upload session not found'));
    }

    // Check if all chunks are uploaded
    const expectedChunks = Array.from({ length: session.totalChunks }, (_, i) => i + 1);
    const missingChunks = expectedChunks.filter(chunkNum => !uploadedChunks.includes(chunkNum));
    
    if (missingChunks.length > 0) {
      return next(createError(400, `Missing chunks: ${missingChunks.join(', ')}`));
    }

    // Determine file extension and upload directory
    const fileExtension = path.extname(fileName).toLowerCase();
    const uploadDir = path.join(__dirname, '..', 'uploads', 'books');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `${timestamp}_${sanitizedFileName}`;
    const finalFilePath = path.join(uploadDir, finalFileName);

    // Assemble chunks
    const writeStream = fs.createWriteStream(finalFilePath);
    
    for (const chunkNum of uploadedChunks.sort((a, b) => a - b)) {
      const chunkFileName = `chunk_${chunkNum.toString().padStart(4, '0')}`;
      const chunkPath = path.join(__dirname, '..', 'uploads', 'chunks', sessionId, chunkFileName);
      
      if (!fs.existsSync(chunkPath)) {
        writeStream.end();
        return next(createError(400, `Chunk ${chunkNum} file not found`));
      }

      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    // Wait for write to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Verify file size
    const stats = fs.statSync(finalFilePath);
    if (stats.size !== parseInt(fileSize)) {
      fs.unlinkSync(finalFilePath); // Clean up
      return next(createError(400, 'File size mismatch after assembly'));
    }

    // Clean up chunks
    const chunkDir = path.join(__dirname, '..', 'uploads', 'chunks', sessionId);
    if (fs.existsSync(chunkDir)) {
      fs.rmSync(chunkDir, { recursive: true, force: true });
    }

    // Remove session
    uploadSessions.delete(sessionId);

    logger.info(`File assembled successfully: ${finalFileName} (${stats.size} bytes)`);

    res.status(200).json({
      success: true,
      fileName: finalFileName,
      originalName: fileName,
      filePath: finalFilePath,
      fileSize: stats.size,
      message: 'File uploaded and assembled successfully'
    });
  } catch (error) {
    logger.error('Error completing upload:', error);
    next(createError(500, 'Failed to complete upload'));
  }
};

/**
 * Clean up failed upload session
 * @route POST /api/upload/cleanup
 * @access Private
 */
const cleanupUpload = async (req, res, next) => {
  try {
    const { uploadId } = req.body;

    if (!uploadId) {
      return next(createError(400, 'Missing uploadId'));
    }

    // Find and clean up session
    let cleaned = false;
    for (const [sessionId, session] of uploadSessions.entries()) {
      if (sessionId.includes(uploadId) || session.fileName.includes(uploadId)) {
        const chunkDir = path.join(__dirname, '..', 'uploads', 'chunks', sessionId);
        if (fs.existsSync(chunkDir)) {
          fs.rmSync(chunkDir, { recursive: true, force: true });
        }
        uploadSessions.delete(sessionId);
        cleaned = true;
        break;
      }
    }

    logger.info(`Upload cleanup completed for: ${uploadId}`);

    res.status(200).json({
      success: true,
      message: cleaned ? 'Upload session cleaned up' : 'No session found to clean up'
    });
  } catch (error) {
    logger.error('Error cleaning up upload:', error);
    next(createError(500, 'Failed to cleanup upload'));
  }
};

/**
 * Get upload session status
 * @route GET /api/upload/status/:sessionId
 * @access Private
 */
const getUploadStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = uploadSessions.get(sessionId);
    if (!session) {
      return next(createError(404, 'Upload session not found'));
    }

    res.status(200).json({
      success: true,
      session: {
        fileName: session.fileName,
        fileSize: session.fileSize,
        totalChunks: session.totalChunks,
        uploadedChunks: session.uploadedChunks,
        progress: Math.round((session.uploadedChunks.length / session.totalChunks) * 100),
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    logger.error('Error getting upload status:', error);
    next(createError(500, 'Failed to get upload status'));
  }
};

module.exports = {
  initializeUpload,
  uploadChunk,
  completeUpload,
  cleanupUpload,
  getUploadStatus
};
