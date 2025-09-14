'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old requirements column since we're using job_requirements now
    await queryInterface.removeColumn('jobs', 'requirements');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the requirements column if needed
    await queryInterface.addColumn('jobs', 'requirements', {
      type: Sequelize.JSON,
      allowNull: true
    });
  }
};
