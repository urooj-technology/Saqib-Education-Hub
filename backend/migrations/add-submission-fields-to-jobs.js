const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add submission_email and submission_guidelines fields to jobs table
    await queryInterface.addColumn('jobs', 'submission_email', {
      type: DataTypes.STRING(255),
      allowNull: true
    });
    
    await queryInterface.addColumn('jobs', 'submission_guidelines', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added columns
    await queryInterface.removeColumn('jobs', 'submission_email');
    await queryInterface.removeColumn('jobs', 'submission_guidelines');
  }
};
