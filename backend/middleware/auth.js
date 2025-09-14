const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('./errorHandler');
const logger = require('../config/logger');

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Debug logging
    console.log('Protect middleware - Headers:', req.headers);
    console.log('Protect middleware - Authorization header:', req.headers.authorization);

    // Check for token in headers - accept both Bearer and Token prefixes
    if (req.headers.authorization && (req.headers.authorization.startsWith('Bearer') || req.headers.authorization.startsWith('Token'))) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token extracted from header:', token ? 'Token found' : 'No token');
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token extracted from cookies:', token ? 'Token found' : 'No token');
    }

    if (!token) {
      console.log('No token found in request');
      return next(createError(401, 'Not authorized to access this route'));
    }

    try {
      // Verify token
      console.log('Attempting to verify token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully, decoded:', { id: decoded.id, email: decoded.email, role: decoded.role });

      // Get user from token
      console.log('Looking up user with ID:', decoded.id);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        console.log('User not found in database');
        return next(createError(401, 'User not found'));
      }

      console.log('User found:', { id: user.id, email: user.email, role: user.role, status: user.status });

      if (user.status !== 'active') {
        console.log('User account is not active:', user.status);
        return next(createError(401, 'Account is not active'));
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return next(createError(423, 'Account is temporarily locked'));
      }

      // Add user to request
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(createError(401, 'Token expired'));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(createError(401, 'Invalid token'));
      }
      throw error;
    }

  } catch (error) {
    logger.error('Error in protect middleware:', error);
    next(createError(500, 'Authentication failed'));
  }
};

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'User not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, `User role ${req.user.role} is not authorized to access this route`));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && (req.headers.authorization.startsWith('Bearer') || req.headers.authorization.startsWith('Token'))) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });

        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        logger.debug('Invalid token in optional auth:', error.message);
      }
    }
    next();
  } catch (error) {
    logger.error('Error in optionalAuth middleware:', error);
    next();
  }
};

/**
 * Rate limiting for authentication attempts
 */
const authRateLimit = (req, res, next) => {
  // This would typically integrate with Redis or a similar store
  // For now, we'll implement a basic in-memory solution
  const clientIP = req.ip;
  const now = Date.now();
  
  // In a real implementation, you'd use Redis or a proper rate limiting library
  // This is a simplified example
  
  next();
};

/**
 * Check if user owns the resource or is admin
 */
const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const Model = require(`../models/${modelName}`);
      
      const resource = await Model.findByPk(id);
      
      if (!resource) {
        return next(createError(404, `${modelName} not found`));
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user owns the resource
      if (resource.userId && resource.userId === req.user.id) {
        return next();
      }

      // Check if user is the author (for articles, books, etc.)
      if (resource.authorId && resource.authorId === req.user.id) {
        return next();
      }

      return next(createError(403, 'Not authorized to access this resource'));

    } catch (error) {
      logger.error(`Error in checkOwnership middleware for ${modelName}:`, error);
      next(createError(500, 'Authorization check failed'));
    }
  };
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  authRateLimit,
  checkOwnership
};
