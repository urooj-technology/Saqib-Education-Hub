'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change requirements column from JSON to TEXT
    await queryInterface.changeColumn('jobs', 'requirements', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Change back to JSON if needed
    await queryInterface.changeColumn('jobs', 'requirements', {
      type: Sequelize.JSON,
      allowNull: true
    });
  }
};
