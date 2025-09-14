console.log('=== TESTING SEEDERS ===');

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
    console.log('1. Loading database...');
    const { sequelize } = require('./config/database');
    console.log('✓ Database config loaded');
    
    console.log('2. Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connected');
    
    console.log('3. Loading seeders...');
    const { runSeeders } = require('./seeders');
    console.log('✓ Seeders loaded');
    
    console.log('4. Running seeders...');
    await runSeeders();
    console.log('✓ Seeders completed');
    
    console.log('=== SUCCESS! ===');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();
