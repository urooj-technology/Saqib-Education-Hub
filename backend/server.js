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

// Set environment variables if not already set
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
if (!process.env.PORT) process.env.PORT = '5000';
if (!process.env.DB_NAME) process.env.DB_NAME = 'saqib_education_hub';
if (!process.env.DB_USER) process.env.DB_USER = 'root';
if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = '';
if (!process.env.DB_HOST) process.env.DB_HOST = 'localhost';
if (!process.env.DB_PORT) process.env.DB_PORT = '3306';
if (!process.env.DB_DIALECT) process.env.DB_DIALECT = 'mysql';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_secret_key_change_in_production';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_change_in_production';
if (!process.env.SESSION_SECRET) process.env.SESSION_SECRET = 'test_session_secret_change_in_production';

require('dotenv').config();

// Import database connection
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const articleRoutes = require('./routes/articles');
const videoRoutes = require('./routes/videos');
const jobRoutes = require('./routes/jobs');
const companyRoutes = require('./routes/companies');
const scholarshipRoutes = require('./routes/scholarships');
const dashboardRoutes = require('./routes/dashboard');
const authorRoutes = require('./routes/authors');
const subscriptionRoutes = require('./routes/subscriptions');
const provinceRoutes = require('./routes/provinces');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "https://api.saqibeduhub.com", "http://localhost:3000", "blob:"],
      connectSrc: ["'self'", "https://api.saqibeduhub.com", "http://localhost:3000"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 1000 : 100), // More lenient for development
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 / 60)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(xss());
app.use(hpp());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://saqibeduhub.com', 'https://www.saqibeduhub.com', 'http://api.saqibeduhub.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept', 'Range']
}));

// Cookie and session middleware
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Accept, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/provinces', provinceRoutes);

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
    
    // Sync database (in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        await sequelize.sync({ force: false, alter: true });
        logger.info('Database synced successfully with alterations.');
      } catch (error) {
        logger.warn('Alter sync failed:', error.message);
        await sequelize.sync({ force: false, alter: false });
        logger.info('Database synced successfully.');
      }
    }
    
    // Run seeders to create default users
    await runSeeders();
    
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
});

module.exports = app;
