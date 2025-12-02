const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Author = sequelize.define('Author', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  penName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'pen_name',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  profileImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image'
  }
}, {
  tableName: 'authors',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['pen_name']
    }
  ]
});

module.exports = Author;
