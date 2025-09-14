const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change years_of_experience column from INTEGER to STRING
    await queryInterface.changeColumn('jobs', 'years_of_experience', {
      type: DataTypes.STRING(100),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to INTEGER (this might cause data loss if there are text values)
    await queryInterface.changeColumn('jobs', 'years_of_experience', {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    });
  }
};
