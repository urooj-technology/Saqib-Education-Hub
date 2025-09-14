const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('jobs', 'companyLogo', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'education', {
      type: DataTypes.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'gender', {
      type: DataTypes.ENUM('any', 'male', 'female'),
      defaultValue: 'any'
    });

    await queryInterface.addColumn('jobs', 'contractType', {
      type: DataTypes.ENUM('permanent', 'temporary', 'contract', 'internship'),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'contractDuration', {
      type: DataTypes.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'contractExtensible', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('jobs', 'probationPeriod', {
      type: DataTypes.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'referenceNumber', {
      type: DataTypes.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'numberOfVacancies', {
      type: DataTypes.INTEGER,
      defaultValue: 1
    });

    await queryInterface.addColumn('jobs', 'salaryRange', {
      type: DataTypes.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'yearsOfExperience', {
      type: DataTypes.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'closingDate', {
      type: DataTypes.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('jobs', 'postDate', {
      type: DataTypes.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jobs', 'companyLogo');
    await queryInterface.removeColumn('jobs', 'education');
    await queryInterface.removeColumn('jobs', 'gender');
    await queryInterface.removeColumn('jobs', 'contractType');
    await queryInterface.removeColumn('jobs', 'contractDuration');
    await queryInterface.removeColumn('jobs', 'contractExtensible');
    await queryInterface.removeColumn('jobs', 'probationPeriod');
    await queryInterface.removeColumn('jobs', 'referenceNumber');
    await queryInterface.removeColumn('jobs', 'numberOfVacancies');
    await queryInterface.removeColumn('jobs', 'salaryRange');
    await queryInterface.removeColumn('jobs', 'yearsOfExperience');
    await queryInterface.removeColumn('jobs', 'closingDate');
    await queryInterface.removeColumn('jobs', 'postDate');
  }
};
