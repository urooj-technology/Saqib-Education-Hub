const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove unused columns from jobs table
    await queryInterface.removeColumn('jobs', 'salary');
    await queryInterface.removeColumn('jobs', 'reference_number');
    await queryInterface.removeColumn('jobs', 'post_date');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the columns if rollback is needed
    await queryInterface.addColumn('jobs', 'salary', {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true
    });
    await queryInterface.addColumn('jobs', 'reference_number', {
      type: DataTypes.STRING(50),
      allowNull: true
    });
    await queryInterface.addColumn('jobs', 'post_date', {
      type: DataTypes.DATE,
      allowNull: true
    });
  }
};
