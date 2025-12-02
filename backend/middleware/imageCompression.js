const { compressImage } = require('./upload');
const logger = require('../config/logger');

/**
 * Middleware to automatically compress uploaded images
 * This should be used after multer upload middleware
 */
const autoCompressImages = (options = {}) => {
  return async (req, res, next) => {
    try {
      if (!req.files) {
        return next();
      }

      const compressionOptions = {
        maxWidth: options.maxWidth || 1200,
        maxHeight: options.maxHeight || 1200,
        quality: options.quality || 85,
        format: options.format || 'jpeg',
        progressive: options.progressive !== false
      };

      // Process all uploaded files
      const compressionPromises = [];

      // Handle single file uploads
      if (req.file) {
        if (isImageFile(req.file)) {
          compressionPromises.push(
            compressImage(req.file.path, compressionOptions)
              .then(compressedPath => {
                req.file.path = compressedPath;
                logger.info(`Compressed single image: ${req.file.originalname}`);
              })
              .catch(error => {
                logger.error(`Failed to compress single image ${req.file.originalname}:`, error);
              })
          );
        }
      }

      // Handle multiple file uploads
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const files = Array.isArray(req.files[fieldName]) 
            ? req.files[fieldName] 
            : [req.files[fieldName]];

          files.forEach(file => {
            if (isImageFile(file)) {
              compressionPromises.push(
                compressImage(file.path, compressionOptions)
                  .then(compressedPath => {
                    file.path = compressedPath;
                    logger.info(`Compressed image: ${file.originalname} (${fieldName})`);
                  })
                  .catch(error => {
                    logger.error(`Failed to compress image ${file.originalname}:`, error);
                  })
              );
            }
          });
        });
      }

      // Wait for all compressions to complete
      if (compressionPromises.length > 0) {
        await Promise.all(compressionPromises);
        logger.info(`Completed compression of ${compressionPromises.length} images`);
      }

      next();
    } catch (error) {
      logger.error('Error in autoCompressImages middleware:', error);
      // Don't fail the request if compression fails
      next();
    }
  };
};

/**
 * Check if a file is an image based on mimetype
 */
const isImageFile = (file) => {
  const imageMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  return imageMimeTypes.includes(file.mimetype);
};

/**
 * Enhanced compression settings for different image types with aggressive optimization
 */
const getCompressionSettings = (fieldName) => {
  const settings = {
    // Cover images for books - optimized for web display
    coverImage: {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 75,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 8,
      effort: 6
    },
    // Profile images - highly compressed for fast loading
    profileImage: {
      maxWidth: 600,
      maxHeight: 600,
      quality: 70,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 9,
      effort: 6
    },
    // Featured images for articles - balanced compression
    featuredImage: {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 72,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 8,
      effort: 6
    },
    // Company logos - high quality but compressed
    companyLogo: {
      maxWidth: 500,
      maxHeight: 500,
      quality: 80,
      format: 'png',
      progressive: true,
      compressionLevel: 9,
      effort: 6
    },
    // Avatar images - heavily compressed
    avatar: {
      maxWidth: 400,
      maxHeight: 400,
      quality: 65,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 9,
      effort: 6
    },
    // General images - moderate compression
    images: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 70,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 8,
      effort: 6
    },
    // Default settings - aggressive compression
    default: {
      maxWidth: 800,
      maxHeight: 800,
      quality: 70,
      format: 'webp',
      progressive: true,
      mozjpeg: true,
      compressionLevel: 8,
      effort: 6
    }
  };

  return settings[fieldName] || settings.default;
};

/**
 * Smart compression middleware that applies different settings based on field name
 */
const smartCompressImages = () => {
  return async (req, res, next) => {
    try {
      if (!req.files) {
        return next();
      }

      const compressionPromises = [];

      // Handle single file uploads
      if (req.file) {
        if (isImageFile(req.file)) {
          const settings = getCompressionSettings(req.file.fieldname);
          compressionPromises.push(
            compressImage(req.file.path, settings)
              .then(compressedPath => {
                req.file.path = compressedPath;
                logger.info(`Smart compressed single image: ${req.file.originalname} (${req.file.fieldname})`);
              })
              .catch(error => {
                logger.error(`Failed to smart compress single image ${req.file.originalname}:`, error);
              })
          );
        }
      }

      // Handle multiple file uploads
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const files = Array.isArray(req.files[fieldName]) 
            ? req.files[fieldName] 
            : [req.files[fieldName]];

          const settings = getCompressionSettings(fieldName);

          files.forEach(file => {
            if (isImageFile(file)) {
              compressionPromises.push(
                compressImage(file.path, settings)
                  .then(compressedPath => {
                    file.path = compressedPath;
                    logger.info(`Smart compressed image: ${file.originalname} (${fieldName})`);
                  })
                  .catch(error => {
                    logger.error(`Failed to smart compress image ${file.originalname}:`, error);
                  })
              );
            }
          });
        });
      }

      // Wait for all compressions to complete
      if (compressionPromises.length > 0) {
        await Promise.all(compressionPromises);
        logger.info(`Completed smart compression of ${compressionPromises.length} images`);
      }

      next();
    } catch (error) {
      logger.error('Error in smartCompressImages middleware:', error);
      // Don't fail the request if compression fails
      next();
    }
  };
};

/**
 * Ultra-aggressive compression middleware for maximum file size reduction
 */
const ultraCompressImages = () => {
  return async (req, res, next) => {
    try {
      if (!req.files) {
        return next();
      }

      const compressionPromises = [];

      // Ultra-aggressive settings for maximum compression
      const ultraSettings = {
        maxWidth: 600,
        maxHeight: 600,
        quality: 50,
        format: 'webp',
        progressive: true,
        mozjpeg: true,
        compressionLevel: 9,
        effort: 6
      };

      // Handle single file uploads
      if (req.file) {
        if (isImageFile(req.file)) {
          compressionPromises.push(
            compressImage(req.file.path, ultraSettings)
              .then(compressedPath => {
                req.file.path = compressedPath;
                logger.info(`Ultra compressed single image: ${req.file.originalname}`);
              })
              .catch(error => {
                logger.error(`Failed to ultra compress single image ${req.file.originalname}:`, error);
              })
          );
        }
      }

      // Handle multiple file uploads
      if (req.files) {
        Object.keys(req.files).forEach(fieldName => {
          const files = Array.isArray(req.files[fieldName]) 
            ? req.files[fieldName] 
            : [req.files[fieldName]];

          files.forEach(file => {
            if (isImageFile(file)) {
              compressionPromises.push(
                compressImage(file.path, ultraSettings)
                  .then(compressedPath => {
                    file.path = compressedPath;
                    logger.info(`Ultra compressed image: ${file.originalname} (${fieldName})`);
                  })
                  .catch(error => {
                    logger.error(`Failed to ultra compress image ${file.originalname}:`, error);
                  })
              );
            }
          });
        });
      }

      // Wait for all compressions to complete
      if (compressionPromises.length > 0) {
        await Promise.all(compressionPromises);
        logger.info(`Completed ultra compression of ${compressionPromises.length} images`);
      }

      next();
    } catch (error) {
      logger.error('Error in ultraCompressImages middleware:', error);
      next();
    }
  };
};

/**
 * Batch compress existing images in a directory
 */
const batchCompressImages = async (directoryPath, options = {}) => {
  const fs = require('fs');
  const path = require('path');
  const { compressImage } = require('./upload');
  
  try {
    const files = fs.readdirSync(directoryPath);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'];
    
    let processedCount = 0;
    let totalSavings = 0;
    
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const ext = path.extname(file).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        try {
          const stats = fs.statSync(filePath);
          const originalSize = stats.size;
          
          await compressImage(filePath, options);
          
          const newStats = fs.statSync(filePath);
          const newSize = newStats.size;
          const savings = originalSize - newSize;
          
          totalSavings += savings;
          processedCount++;
          
          logger.info(`Batch compressed: ${file} - Saved ${(savings / 1024).toFixed(2)} KB`);
        } catch (error) {
          logger.error(`Failed to batch compress ${file}:`, error);
        }
      }
    }
    
    logger.info(`Batch compression complete: ${processedCount} images processed, ${(totalSavings / 1024 / 1024).toFixed(2)} MB saved`);
    return { processedCount, totalSavings };
  } catch (error) {
    logger.error('Error in batchCompressImages:', error);
    throw error;
  }
};

module.exports = {
  autoCompressImages,
  smartCompressImages,
  ultraCompressImages,
  isImageFile,
  getCompressionSettings,
  batchCompressImages
};
