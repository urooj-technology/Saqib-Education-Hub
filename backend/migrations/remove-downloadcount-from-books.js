'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the downloadCount column from the books table
    await queryInterface.removeColumn('books', 'downloadCount');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the downloadCount column back if rollback is needed
    await queryInterface.addColumn('books', 'downloadCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    });
  }
};
