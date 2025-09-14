#!/usr/bin/env node

/**
 * CLI script for running database seeders
 * Usage: node seed.js
 */

const { runSeedersManually } = require('./seeders');

console.log('🌱 Starting database seeding...\n');

runSeedersManually()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  });
