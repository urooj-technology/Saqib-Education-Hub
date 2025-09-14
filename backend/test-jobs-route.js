console.log('=== TESTING JOBS ROUTE ===');

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
    console.log('1. Loading jobs route...');
    const jobRoutes = require('./routes/jobs');
    console.log('✓ Jobs route loaded');
    
    console.log('=== SUCCESS! ===');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
