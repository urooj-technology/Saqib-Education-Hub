const { initializeDefaultUsers } = require('./defaultAdmin');
const seedAuthors = require('./authorSeeder');
const seedProvinces = require('./provinceSeeder');
const seedSubscriptionPlans = require('./subscriptionPlanSeeder');
const assignFreePlanToUsers = require('./assignFreePlanToUsers');
const logger = require('../config/logger');

/**
 * Initialize all seeders
 */
const runSeeders = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Initialize default users
    await initializeDefaultUsers();
    
    // Seed provinces
    await seedProvinces();
    
    // Seed authors
    await seedAuthors();
    
    // Seed subscription plans
    await seedSubscriptionPlans();
    
    // Assign free plan to users without subscriptions
    await assignFreePlanToUsers();
    
    logger.info('Database seeding completed successfully');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    // Don't throw error to prevent app from crashing
    // Just log it and continue
  }
};

/**
 * Run seeders manually (for CLI usage)
 */
const runSeedersManually = async () => {
  try {
    await runSeeders();
    process.exit(0);
  } catch (error) {
    logger.error('Manual seeding failed:', error);
    process.exit(1);
  }
};

module.exports = {
  runSeeders,
  runSeedersManually
};
