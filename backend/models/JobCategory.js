const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobCategory = sequelize.define('JobCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'job_categories',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    }
  ]
});

// Instance methods
JobCategory.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

module.exports = JobCategory;
