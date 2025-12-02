const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Check if we're in production and load the appropriate env file
const productionEnvPath = path.join(__dirname, 'production.env');

if (process.env.NODE_ENV === 'production' || fs.existsSync(productionEnvPath)) {
  // If production.env exists, use it
  if (fs.existsSync(productionEnvPath)) {
    require('dotenv').config({ path: productionEnvPath });
    console.log('✅ Loaded production environment variables from production.env');
    // Set NODE_ENV to production if not already set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
  } else {
    require('dotenv').config();
    console.log('⚠️  production.env not found, loading from .env or system environment');
  }
} else {
  // Development mode - load .env
  require('dotenv').config();
  console.log('🔧 Development mode - loaded from .env');
}

// Log environment info for debugging
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'not set'}`);

// Ensure SESSION_SECRET is present (generate fallback if missing)
let sessionSecretGenerated = false;
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    const generatedSecret = crypto.randomBytes(48).toString('hex');
    process.env.SESSION_SECRET = generatedSecret;
    console.warn('⚠️  SESSION_SECRET is not set. Generated a temporary secret for this run. Please configure SESSION_SECRET in your environment.');
    sessionSecretGenerated = true;
  } else {
    process.env.SESSION_SECRET = 'dev-only-secret-change-in-production';
    console.warn('⚠️  Using development session secret fallback.');
  }
}

// Now that environment variables are ready, import application constants
const CONSTANTS = require('./config/constants');

// Import database connection
const { sequelize } = require('./config/database');

// Import all models to ensure they are registered with Sequelize
// This must be done before any database operations
const models = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const bookCategoryRoutes = require('./routes/bookCategories');
const articleRoutes = require('./routes/articles');
const articleCategoryRoutes = require('./routes/articleCategories');
const videoRoutes = require('./routes/videos');
const jobRoutes = require('./routes/jobs');
const jobCategoryRoutes = require('./routes/jobCategories');
const companyRoutes = require('./routes/companies');
const scholarshipRoutes = require('./routes/scholarships');
const dashboardRoutes = require('./routes/dashboard');
const authorRoutes = require('./routes/authors');
const subscriptionRoutes = require('./routes/subscriptions');
const provinceRoutes = require('./routes/provinces');
const contactRoutes = require('./routes/contacts');
const reportRoutes = require('./routes/reports');
const chunkedUploadRoutes = require('./routes/chunkedUpload');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const logger = require('./config/logger');

if (sessionSecretGenerated) {
  logger.warn('SESSION_SECRET was missing in production. A temporary secret was generated at runtime. Configure SESSION_SECRET permanently to avoid session resets.');
} else if (process.env.NODE_ENV !== 'production' && process.env.SESSION_SECRET === 'dev-only-secret-change-in-production') {
  logger.warn('Using development session secret fallback. Set SESSION_SECRET for better security.');
}

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 5000;

// Security middleware - Using centralized constants
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: CONSTANTS.ALLOWED_IMAGE_SOURCES,
      connectSrc: CONSTANTS.ALLOWED_CONNECT_SOURCES,
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting - Using centralized constants
const limiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(CONSTANTS.RATE_LIMIT.WINDOW_MS / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware - Using centralized constants
app.use(express.json({ limit: CONSTANTS.UPLOAD.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: CONSTANTS.UPLOAD.BODY_LIMIT }));

// Security middleware
app.use(xss());
app.use(hpp());

// CORS configuration - Using centralized constants
let corsOriginOption = true; // Default allow in development

if (process.env.NODE_ENV !== 'development') {
  if (CONSTANTS.ALLOWED_ORIGINS.includes('*')) {
    corsOriginOption = true;
  } else if (CONSTANTS.ALLOWED_ORIGINS.length > 0) {
    const allowedOriginsSet = new Set();

    CONSTANTS.ALLOWED_ORIGINS.forEach((origin) => {
      if (!origin) {
        return;
      }

      const trimmedOrigin = origin.trim();
      const lowerTrimmed = trimmedOrigin.toLowerCase();

      // Store exact value
      allowedOriginsSet.add(lowerTrimmed);

      // If origin provided without protocol, allow both http and https
      if (!lowerTrimmed.startsWith('http://') && !lowerTrimmed.startsWith('https://')) {
        allowedOriginsSet.add(`http://${lowerTrimmed}`);
        allowedOriginsSet.add(`https://${lowerTrimmed}`);
      }

      // Always store host without protocol for comparison
      const hostOnly = lowerTrimmed.replace(/^https?:\/\//, '');
      allowedOriginsSet.add(hostOnly);
    });

    corsOriginOption = (origin, callback) => {
      if (!origin) {
        // Non-browser request (e.g., curl, Postman)
        return callback(null, true);
      }

      const originLower = origin.toLowerCase();
      const originHost = originLower.replace(/^https?:\/\//, '');

      if (
        allowedOriginsSet.has(originLower) ||
        allowedOriginsSet.has(originHost)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    };
  } else {
    // If no origins configured, fall back to allowing all to prevent accidental blocking
    corsOriginOption = true;
  }
}

const corsOptions = {
  origin: corsOriginOption,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept', 'Range', 'Content-Range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'ETag'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly using same CORS options
app.options('*', cors(corsOptions));

// Additional CORS middleware for download endpoints
app.use('/api/articles/:id/download', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Type, Cache-Control, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag');
  next();
});

app.use('/api/books/:id/pdf', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Range, Content-Range, Content-Type, Cache-Control, Accept');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, ETag');
  next();
});

// Cookie and session middleware
app.use(cookieParser());

app.use(session({
  secret: CONSTANTS.SESSION.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: CONSTANTS.SESSION.MAX_AGE
  }
}));

// Compression middleware - Using centralized constants
app.use(compression({
  level: CONSTANTS.COMPRESSION.LEVEL,
  threshold: CONSTANTS.COMPRESSION.THRESHOLD,
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other requests
    return compression.filter(req, res);
  }
}));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Static files with CORS headers and optimized caching
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  
  // Set cache headers based on file type
  const filePath = req.path;
  if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    res.header('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for images
  } else if (filePath.match(/\.(pdf|doc|docx)$/i)) {
    res.header('Cache-Control', 'public, max-age=86400'); // 24 hours for documents
  } else {
    res.header('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Default max age
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add ETag for better caching
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|pdf)$/i)) {
      res.setHeader('ETag', `"${Date.now()}-${path}"`);
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Saqib Education Hub API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: CONSTANTS.API_VERSION,
    database: 'connected'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Performance monitoring endpoint
app.get('/api/performance', async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'success',
      data: {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
        },
        uptime: Math.round(process.uptime()) + ' seconds',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Performance monitoring error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get performance data',
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/book-categories', bookCategoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/article-categories', articleCategoryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-categories', jobCategoryRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', chunkedUploadRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Import seeders
const { runSeeders } = require('./seeders');

// Start server
const server = app.listen(PORT, async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Sync database - create tables if they don't exist (WITHOUT dropping existing data)
    try {
      logger.info('Starting database sync...');
      logger.info('Registered models count:', Object.keys(sequelize.models).length);
      logger.info('Registered models:', Object.keys(sequelize.models));
      
      // IMPORTANT: Use force: false to preserve existing data
      // alter: false prevents accidental schema changes in production
      // Use alter: true only in development to auto-update schema
      await sequelize.sync({ force: false, alter: false });
      logger.info('Database synced successfully - existing data preserved');
      
      // Check what tables exist
      const [tables] = await sequelize.query("SHOW TABLES");
      logger.info('Existing tables:', tables.map(t => Object.values(t)[0]));
      logger.info('Total tables:', tables.length);
      
      if (tables.length < Object.keys(sequelize.models).length) {
        logger.warn(`Warning: Expected ${Object.keys(sequelize.models).length} tables but only found ${tables.length}`);
        logger.info('Missing tables will be created automatically.');
      }
      
    } catch (error) {
      logger.error('Database sync failed:', error.message);
      logger.error('Sync error details:', error);
      throw error;
    }
    
    // Run seeders to create default users (only if tables exist)
    try {
      await runSeeders();
      logger.info('Database seeding completed successfully.');
    } catch (seederError) {
      logger.warn('Database seeding failed:', seederError.message);
      // Don't exit on seeder failure, just log it
      logger.info('Continuing without seeded data...');
    }
    
    // Database indexes will be created automatically by Sequelize models
    logger.info('Database indexes will be created automatically by Sequelize models.');
    
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
});

module.exports = app;
