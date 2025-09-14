const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ArticleAuthor = sequelize.define('ArticleAuthor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'article_id',
    references: {
      model: 'articles',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id',
    references: {
      model: 'authors',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'article_authors',
  timestamps: true,
  indexes: [
    {
      fields: ['article_id']
    },
    {
      fields: ['author_id']
    },
    {
      unique: true,
      fields: ['article_id', 'author_id']
    }
  ]
});

module.exports = ArticleAuthor;
