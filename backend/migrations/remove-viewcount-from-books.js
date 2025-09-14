'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the viewCount column from the books table
    await queryInterface.removeColumn('books', 'viewCount');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the viewCount column back if rollback is needed
    await queryInterface.addColumn('books', 'viewCount', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: {
        min: 0
      }
    });
  }
};
