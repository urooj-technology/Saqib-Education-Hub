'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename requirements column to duties_and_responsibilities
    await queryInterface.renameColumn('jobs', 'requirements', 'duties_and_responsibilities');
  },

  down: async (queryInterface, Sequelize) => {
    // Rename back to requirements if needed
    await queryInterface.renameColumn('jobs', 'duties_and_responsibilities', 'requirements');
  }
};
