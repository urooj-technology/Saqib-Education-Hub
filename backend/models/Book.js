const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255],
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  publisher: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: new Date().getFullYear() + 1
    }
  },
  edition: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  pages: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1
    }
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'English'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'book_categories',
      key: 'id'
    },
    field: 'category_id'
  },
  format: {
    type: DataTypes.ENUM('pdf', 'epub', 'mobi', 'docx', 'txt', 'html'),
    defaultValue: 'pdf'
  },
  fileSize: {
    type: DataTypes.INTEGER, // in bytes
    allowNull: true
  },
  filePath: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    validate: {
      len: [3, 3]
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'pending_review'),
    defaultValue: 'draft',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'books',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['category_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['language']
    },
    {
      fields: ['format']
    },
    {
      fields: ['price']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['status', 'is_active']
    },
    {
      fields: ['category_id', 'status']
    },
    {
      fields: ['language', 'status']
    }
  ]
});

// Instance methods



// Class methods
Book.findByCategory = function(categoryId) {
  return this.findAll({ 
    where: { categoryId, status: 'published', isActive: true },
    include: [{
      model: require('./BookCategory'),
      as: 'category'
    }]
  });
};

Book.findByAuthor = function(authorId) {
  const { BookAuthor } = require('./index');
  return this.findAll({ 
    include: [{
      model: BookAuthor,
      where: { authorId, isActive: true },
      required: true
    }],
    where: { status: 'published', isActive: true },
    order: [['publicationYear', 'DESC']]
  });
};

Book.search = function(query) {
  const { Op } = require('sequelize');
  const { BookAuthor, Author } = require('./index');
  return this.findAll({
    include: [{
      model: BookAuthor,
      include: [{
        model: Author,
        where: {
          [Op.or]: [
            { penName: { [Op.like]: `%${query}%` } }
          ]
        }
      }]
    }],
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ],
      status: 'published',
      isActive: true
    },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Book;
