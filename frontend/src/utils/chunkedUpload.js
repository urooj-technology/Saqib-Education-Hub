/**
 * Chunked file upload utility for large files
 * Splits files into chunks and uploads them sequentially or in parallel
 */

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
const MAX_CONCURRENT_UPLOADS = 3; // Maximum concurrent chunk uploads

/**
 * Upload a file in chunks
 * @param {File} file - The file to upload
 * @param {string} uploadUrl - The upload endpoint URL
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @param {Object} headers - Additional headers
 * @returns {Promise} - Upload result
 */
export const uploadFileInChunks = async (
  file, 
  uploadUrl, 
  options = {}, 
  onProgress = null, 
  headers = {}
) => {
  const {
    chunkSize = CHUNK_SIZE,
    maxConcurrent = MAX_CONCURRENT_UPLOADS,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const totalChunks = Math.ceil(file.size / chunkSize);
  const uploadId = generateUploadId();
  
  console.log(`Starting chunked upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks)`);

  try {
    // Initialize upload session
    const initResponse = await fetch(`${uploadUrl}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        totalChunks,
        uploadId,
        mimeType: file.type
      })
    });

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize upload: ${initResponse.statusText}`);
    }

    const initData = await initResponse.json();
    const sessionId = initData.sessionId || uploadId;

    // Upload chunks
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      chunks.push({
        chunkNumber: i + 1,
        totalChunks,
        start,
        end,
        data: file.slice(start, end)
      });
    }

    // Upload chunks with concurrency control
    const uploadedChunks = await uploadChunksConcurrently(
      chunks,
      uploadUrl,
      sessionId,
      headers,
      maxConcurrent,
      retryAttempts,
      retryDelay,
      onProgress
    );

    // Complete upload
    const completeResponse = await fetch(`${uploadUrl}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        sessionId,
        uploadedChunks: uploadedChunks.map(c => c.chunkNumber),
        fileName: file.name,
        fileSize: file.size
      })
    });

    if (!completeResponse.ok) {
      throw new Error(`Failed to complete upload: ${completeResponse.statusText}`);
    }

    const result = await completeResponse.json();
    console.log(`Upload completed: ${file.name}`);
    
    if (onProgress) {
      onProgress(100);
    }

    return result;
  } catch (error) {
    console.error('Chunked upload failed:', error);
    
    // Cleanup on failure
    try {
      await fetch(`${uploadUrl}/cleanup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ uploadId })
      });
    } catch (cleanupError) {
      console.error('Cleanup failed:', cleanupError);
    }
    
    throw error;
  }
};

/**
 * Upload chunks concurrently with retry logic
 */
const uploadChunksConcurrently = async (
  chunks,
  uploadUrl,
  sessionId,
  headers,
  maxConcurrent,
  retryAttempts,
  retryDelay,
  onProgress
) => {
  const uploadedChunks = [];
  const totalChunks = chunks.length;
  let completedChunks = 0;

  const uploadChunk = async (chunk, attempt = 1) => {
    try {
      const formData = new FormData();
      formData.append('chunk', chunk.data);
      formData.append('chunkNumber', chunk.chunkNumber);
      formData.append('totalChunks', chunk.totalChunks);
      formData.append('sessionId', sessionId);

      const response = await fetch(`${uploadUrl}/chunk`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      completedChunks++;
      
      if (onProgress) {
        onProgress(Math.round((completedChunks / totalChunks) * 100));
      }

      return { ...chunk, result };
    } catch (error) {
      if (attempt < retryAttempts) {
        console.warn(`Chunk ${chunk.chunkNumber} failed, retrying (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        return uploadChunk(chunk, attempt + 1);
      } else {
        throw new Error(`Chunk ${chunk.chunkNumber} failed after ${retryAttempts} attempts: ${error.message}`);
      }
    }
  };

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += maxConcurrent) {
    const batch = chunks.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(chunk => uploadChunk(chunk))
    );
    uploadedChunks.push(...batchResults);
  }

  return uploadedChunks.sort((a, b) => a.chunkNumber - b.chunkNumber);
};

/**
 * Generate a unique upload ID
 */
const generateUploadId = () => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Upload file with progress tracking (simple version for smaller files)
 * @param {File} file - The file to upload
 * @param {string} uploadUrl - The upload endpoint URL
 * @param {Function} onProgress - Progress callback
 * @param {Object} headers - Additional headers
 * @returns {Promise} - Upload result
 */
export const uploadFileWithProgress = async (
  file,
  uploadUrl,
  onProgress = null,
  headers = {}
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          resolve({ success: true, message: 'Upload completed' });
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed: Network error'));
    });

    // Handle abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    // Start upload
    xhr.open('POST', uploadUrl);
    
    // Set headers
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
};

/**
 * Smart upload function that chooses between chunked and regular upload
 * @param {File} file - The file to upload
 * @param {string} uploadUrl - The upload endpoint URL
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @param {Object} headers - Additional headers
 * @returns {Promise} - Upload result
 */
export const smartUpload = async (
  file,
  uploadUrl,
  options = {},
  onProgress = null,
  headers = {}
) => {
  const { chunkThreshold = 10 * 1024 * 1024 } = options; // 10MB threshold

  if (file.size > chunkThreshold) {
    console.log(`File size (${file.size}) exceeds threshold (${chunkThreshold}), using chunked upload`);
    return uploadFileInChunks(file, uploadUrl, options, onProgress, headers);
  } else {
    console.log(`File size (${file.size}) is below threshold (${chunkThreshold}), using regular upload`);
    return uploadFileWithProgress(file, uploadUrl, onProgress, headers);
  }
};

export default {
  uploadFileInChunks,
  uploadFileWithProgress,
  smartUpload
};
