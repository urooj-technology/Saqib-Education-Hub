'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the benefits column to job_requirements
    await queryInterface.renameColumn('jobs', 'benefits', 'job_requirements');
  },

  down: async (queryInterface, Sequelize) => {
    // Rename back to benefits if needed
    await queryInterface.renameColumn('jobs', 'job_requirements', 'benefits');
  }
};
