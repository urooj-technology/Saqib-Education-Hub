/**
 * Application Constants Configuration
 * Centralized constants to avoid hardcoding values throughout the application
 */

// Parse comma-separated environment variables into arrays
const parseEnvArray = (envVar, fallback = []) => {
  if (!envVar) return fallback;
  return envVar.split(',').map(item => item.trim()).filter(Boolean);
};

module.exports = {
  // API Configuration
  API_VERSION: process.env.API_VERSION || '1.0.0',
  
  // CORS Configuration
  ALLOWED_ORIGINS: parseEnvArray(
    process.env.ALLOWED_ORIGINS,
    process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000' , 'https://saqibeduhub.com', 'https://api.saqibeduhub.com'] 
      : []
  ),
  
  // Content Security Policy - Allowed Image Sources
  ALLOWED_IMAGE_SOURCES: parseEnvArray(
    process.env.ALLOWED_IMAGE_SOURCES,
    ["'self'", "data:", "https:", "blob:"]
  ),
  
  // Content Security Policy - Allowed Connect Sources
  ALLOWED_CONNECT_SOURCES: parseEnvArray(
    process.env.ALLOWED_CONNECT_SOURCES,
    ["'self'"]
  ),
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 1000),
  },
  
  // Session Configuration
  SESSION: {
    // No fallback - must be set in environment
    SECRET: process.env.SESSION_SECRET,
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // File Upload Limits
  UPLOAD: {
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    BODY_LIMIT: '10mb',
  },
  
  // Cache Configuration
  CACHE: {
    ENABLED: process.env.CACHE_ENABLED !== 'false',
    TTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
  },
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100,
  },
  
  // Compression Settings
  COMPRESSION: {
    LEVEL: 6,
    THRESHOLD: 1024, // 1KB
  },
  
  // Image Optimization
  IMAGE: {
    MAX_WIDTH: 800,
    MAX_HEIGHT: 800,
    QUALITY: 75,
    FORMAT: 'jpeg',
  },
};

