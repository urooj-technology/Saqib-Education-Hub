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
  const dirs = ['images', 'documents', 'videos', 'books', 'article', 'companies'];
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
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
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

// Helper function to resize image
const resizeImage = async (filePath, width = 800, height = 600, quality = 80) => {
  try {
    const sharp = require('sharp');
    const resizedPath = filePath.replace(/(\.[^.]+)$/, '-resized$1');
    
    await sharp(filePath)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toFile(resizedPath);
    
    // Delete original file
    deleteFile(filePath);
    
    return resizedPath;
  } catch (error) {
    console.error('Error resizing image:', error);
    return filePath;
  }
};

module.exports = {
  upload,
  handleMulterError,
  deleteFile,
  getFileUrl,
  validateImageDimensions,
  resizeImage
};
