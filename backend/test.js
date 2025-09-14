console.log('Node.js is working!');
console.log('Testing basic imports...');

try {
  const express = require('express');
  console.log('Express imported successfully');
  
  const cors = require('cors');
  console.log('CORS imported successfully');
  
  const helmet = require('helmet');
  console.log('Helmet imported successfully');
  
  const compression = require('compression');
  console.log('Compression imported successfully');
  
  const morgan = require('morgan');
  console.log('Morgan imported successfully');
  
  const rateLimit = require('express-rate-limit');
  console.log('Rate limit imported successfully');
  
  const hpp = require('hpp');
  console.log('HPP imported successfully');
  
  const xss = require('xss-clean');
  console.log('XSS imported successfully');
  
  const cookieParser = require('cookie-parser');
  console.log('Cookie parser imported successfully');
  
  const session = require('express-session');
  console.log('Session imported successfully');
  
  const path = require('path');
  console.log('Path imported successfully');
  
  console.log('All basic dependencies imported successfully!');
  
} catch (error) {
  console.error('Error importing dependencies:', error.message);
  console.error('Stack trace:', error.stack);
}
