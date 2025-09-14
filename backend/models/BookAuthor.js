const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BookAuthor = sequelize.define('BookAuthor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'authors',
      key: 'id'
    }
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'book_authors',
  timestamps: true,
  indexes: [
    {
      fields: ['book_id']
    },
    {
      fields: ['author_id']
    },
    {
      unique: true,
      fields: ['book_id', 'author_id']
    }
  ]
});

module.exports = BookAuthor;
