console.log('Starting simplified server test...');

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

try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  console.log('Dotenv loaded successfully');
  
  console.log('Loading express...');
  const express = require('express');
  console.log('Express loaded successfully');
  
  console.log('Loading database config...');
  const { sequelize } = require('./config/database');
  console.log('Database config loaded successfully');
  
  console.log('Testing database connection...');
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection successful!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    });
    
} catch (error) {
  console.error('Error in test:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
