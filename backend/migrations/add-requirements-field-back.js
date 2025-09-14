'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add back the requirements column for Duties & Responsibilities
    await queryInterface.addColumn('jobs', 'requirements', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the requirements column if needed
    await queryInterface.removeColumn('jobs', 'requirements');
  }
};
