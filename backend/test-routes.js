console.log('=== TESTING ROUTES ===');

// Set basic environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';
process.env.DB_NAME = 'saqib_education_hub';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_DIALECT = 'mysql';
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.SESSION_SECRET = 'test_session_secret';

(async () => {
  try {
    console.log('1. Loading express...');
    const express = require('express');
    console.log('✓ Express loaded');
    
    console.log('2. Loading routes...');
    const authRoutes = require('./routes/auth');
    console.log('✓ Auth routes loaded');
    
    const userRoutes = require('./routes/users');
    console.log('✓ User routes loaded');
    
    const bookRoutes = require('./routes/books');
    console.log('✓ Book routes loaded');
    
    const articleRoutes = require('./routes/articles');
    console.log('✓ Article routes loaded');
    
    const videoRoutes = require('./routes/videos');
    console.log('✓ Video routes loaded');
    
    const jobRoutes = require('./routes/jobs');
    console.log('✓ Job routes loaded');
    
    const scholarshipRoutes = require('./routes/scholarships');
    console.log('✓ Scholarship routes loaded');
    
    const dashboardRoutes = require('./routes/dashboard');
    console.log('✓ Dashboard routes loaded');
    
    console.log('3. Creating app...');
    const app = express();
    console.log('✓ App created');
    
    console.log('4. Setting up routes...');
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/articles', articleRoutes);
    app.use('/api/videos', videoRoutes);
    app.use('/api/jobs', jobRoutes);
    app.use('/api/scholarships', scholarshipRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    console.log('✓ All routes configured');
    
    console.log('=== SUCCESS! ===');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
