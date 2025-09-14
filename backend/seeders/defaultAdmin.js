const bcrypt = require('bcryptjs');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Create default admin user
 */
const createDefaultAdmin = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: 'admin@gmail.com' }
    });

    if (existingAdmin) {
      logger.info('Default admin user already exists');
      return existingAdmin;
    }

    // Create default admin user
    const adminUser = await User.create({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@gmail.com',
      password: 'Admin@123', // This will be hashed by the model hook
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
      emailVerified: true
    });

    logger.info('Default admin user created successfully');
    logger.info(`Admin Email: ${adminUser.email}`);
    logger.info(`Admin Password: Admin@123`);
    logger.info('Please change the password after first login!');

    return adminUser;

  } catch (error) {
    logger.error('Error creating default admin user:', error);
    throw error;
  }
};


/**
 * Initialize all default users
 */
const initializeDefaultUsers = async () => {
  try {
    logger.info('Initializing default users...');
    
    await createDefaultAdmin();
    
    logger.info('Default users initialization completed successfully');
    
    // Log default credentials
    console.log('\n=== DEFAULT USER CREDENTIALS ===');
    console.log('Admin: admin@gmail.com / Admin@123');
    console.log('=====================================\n');
    console.log('⚠️  IMPORTANT: Change this password after first login! ⚠️\n');
    
  } catch (error) {
    logger.error('Failed to initialize default users:', error);
    throw error;
  }
};

module.exports = {
  createDefaultAdmin,
  initializeDefaultUsers
};
