const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookCategory = sequelize.define('BookCategory', {
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
  }
}, {
  tableName: 'book_categories',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    }
  ]
});

// Instance methods
BookCategory.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

// Class methods - removed recursive findAll method

module.exports = BookCategory;
