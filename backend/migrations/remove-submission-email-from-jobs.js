const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the submission_email column from jobs table
    await queryInterface.removeColumn('jobs', 'submission_email');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the submission_email column back if needed to rollback
    await queryInterface.addColumn('jobs', 'submission_email', {
      type: DataTypes.STRING(255),
      allowNull: true
    });
  }
};
