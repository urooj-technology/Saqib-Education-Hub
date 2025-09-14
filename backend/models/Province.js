const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Province = sequelize.define('Province', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100],
      notEmpty: true
    }
  },

  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Afghanistan'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'provinces',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
   
    {
      fields: ['country']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Province;
