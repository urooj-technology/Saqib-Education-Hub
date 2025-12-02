const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('./errorHandler');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different file types
const createUploadDirs = () => {
  const dirs = ['images', 'documents', 'videos', 'books', 'article', 'companies', 'temp', 'chunks'];
  dirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    // Determine upload directory based on file type
    if (file.fieldname === 'coverImage' || file.fieldname === 'avatar' || file.fieldname === 'profileImage' || file.fieldname === 'logo') {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.fieldname === 'featuredImage' || file.fieldname === 'featured_image') {
      uploadPath = path.join(uploadsDir, 'article');
    } else if (file.fieldname === 'bookFile') {
      uploadPath = path.join(uploadsDir, 'books');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(uploadsDir, 'documents');
    } else if (file.fieldname === 'documentAttachment') {
      uploadPath = path.join(uploadsDir, 'article');
    } else if (file.fieldname === 'videoFile') {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.fieldname === 'companyLogo') {
      uploadPath = path.join(uploadsDir, 'companies');
    } else if (file.fieldname === 'chunk') {
      // For chunked uploads, use a temporary directory
      uploadPath = path.join(uploadsDir, 'temp');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
    } else {
      uploadPath = path.join(uploadsDir, 'documents');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    
    // Clean the original filename to handle Unicode characters properly
    let originalName = path.basename(file.originalname, extension);
    
    // Replace problematic characters but preserve Unicode
    originalName = originalName
      .replace(/[<>:"/\\|?*]/g, '-') // Replace invalid filename characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .substring(0, 100); // Limit length
    
    // If original name is empty or only special chars, use a default
    if (!originalName || originalName === '-') {
      originalName = 'file';
    }
    
    const filename = `${originalName}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  const allowedBookTypes = [
    'application/pdf',
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    'text/html'
  ];
  const allowedVideoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm'
  ];

  let allowedTypes = [];

  // Determine allowed types based on field name
  switch (file.fieldname) {
    case 'coverImage':
    case 'avatar':
    case 'profileImage':
    case 'featuredImage':
    case 'featured_image':
    case 'logo':
    case 'companyLogo':
      allowedTypes = allowedImageTypes;
      break;
    case 'bookFile':
      allowedTypes = allowedBookTypes;
      break;
    case 'videoFile':
      allowedTypes = allowedVideoTypes;
      break;
    case 'document':
    case 'documentAttachment':
      allowedTypes = allowedDocumentTypes;
      break;
    case 'chunk':
      // For chunked uploads, allow all file types since chunks are binary data
      allowedTypes = ['application/octet-stream', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      break;
    default:
      allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes, ...allowedBookTypes, ...allowedVideoTypes];
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(400, `File type ${file.mimetype} is not allowed for ${file.fieldname}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per request
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(createError(400, 'File too large'));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(createError(400, 'Too many files'));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(createError(400, 'Unexpected file field'));
    }
  }
  next(error);
};

// Helper function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to get file URL
const getFileUrl = (filePath, req) => {
  if (!filePath) return null;
  
  // Always use HTTPS for production, check for HTTPS header in development
  const protocol = (process.env.NODE_ENV === 'production' || req.get('x-forwarded-proto') === 'https') ? 'https' : 'http';
  const baseUrl = `${protocol}://${req.get('host')}`;
  const relativePath = filePath.replace(path.join(__dirname, '..'), '');
  return `${baseUrl}${relativePath.replace(/\\/g, '/')}`;
};

// Helper function to validate file dimensions (for images)
const validateImageDimensions = (filePath, minWidth = 100, minHeight = 100) => {
  return new Promise((resolve, reject) => {
    const sharp = require('sharp');
    
    sharp(filePath)
      .metadata()
      .then(metadata => {
        if (metadata.width < minWidth || metadata.height < minHeight) {
          reject(new Error(`Image dimensions must be at least ${minWidth}x${minHeight}px`));
        } else {
          resolve(true);
        }
      })
      .catch(reject);
  });
};

// Enhanced helper function to compress and resize image with aggressive optimization
const compressImage = async (filePath, options = {}) => {
  try {
    const sharp = require('sharp');
    const {
      maxWidth = 800,
      maxHeight = 800,
      quality = 70,
      format = 'webp',
      progressive = true,
      mozjpeg = true,
      compressionLevel = 8,
      effort = 6
    } = options;

    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    
    // Only compress if it's an image and larger than our target
    if (!metadata.width || !metadata.height) {
      return filePath;
    }

    // Calculate new dimensions with more aggressive sizing
    let { width, height } = metadata;
    const aspectRatio = width / height;

    if (width > maxWidth || height > maxHeight) {
      if (aspectRatio > 1) {
        width = maxWidth;
        height = Math.round(maxWidth / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(maxHeight * aspectRatio);
      }
    }

    // Always process for aggressive compression
    const compressedPath = filePath.replace(/(\.[^.]+)$/, '-compressed$1');
    
    let sharpInstance = sharp(filePath)
      .resize(width, height, { 
        fit: 'inside', 
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      })
      .sharpen(0.5) // Add slight sharpening to compensate for compression
      .normalize() // Normalize colors for better compression
      .gamma(2.2); // Apply gamma correction

    // Apply format-specific optimizations with aggressive settings
    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ 
          quality: Math.max(quality - 10, 50), // More aggressive quality reduction
          progressive,
          mozjpeg,
          trellisQuantisation: true,
          overshootDeringing: true,
          optimizeScans: true
        });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality: Math.max(quality - 10, 50),
          progressive,
          compressionLevel: Math.max(compressionLevel, 9),
          effort: effort,
          adaptiveFiltering: true,
          palette: true // Enable palette mode for smaller files
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ 
          quality: Math.max(quality - 5, 45), // WebP can handle lower quality better
          lossless: false,
          effort: effort,
          smartSubsample: true,
          reductionEffort: 6
        });
        break;
      default:
        // Fallback to aggressive JPEG compression
        sharpInstance = sharpInstance.jpeg({ 
          quality: Math.max(quality - 15, 45),
          progressive,
          mozjpeg: true,
          trellisQuantisation: true
        });
    }

    await sharpInstance.toFile(compressedPath);
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(filePath).size;
    const compressedSize = fs.statSync(compressedPath).size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    // Delete original file and rename compressed file
    deleteFile(filePath);
    fs.renameSync(compressedPath, filePath);
    
    console.log(`Image aggressively compressed: ${path.basename(filePath)} (${metadata.width}x${metadata.height} -> ${width}x${height}) - ${compressionRatio}% size reduction`);
    
    return filePath;
  } catch (error) {
    console.error('Error compressing image:', error);
    return filePath;
  }
};

// Helper function to resize image (legacy function for backward compatibility)
const resizeImage = async (filePath, width = 800, height = 600, quality = 80) => {
  return compressImage(filePath, { maxWidth: width, maxHeight: height, quality });
};

module.exports = {
  upload,
  handleMulterError,
  deleteFile,
  getFileUrl,
  validateImageDimensions,
  resizeImage,
  compressImage
};
