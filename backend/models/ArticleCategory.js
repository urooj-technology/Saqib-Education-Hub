const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ArticleCategory = sequelize.define('ArticleCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  }
}, {
  tableName: 'article_categories',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    }
  ]
});

// Instance methods
ArticleCategory.prototype.toJSON = function() {
  const values = { ...this.get() };
  return values;
};

// Class methods - removed recursive findAll method

module.exports = ArticleCategory;
