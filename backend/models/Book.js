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
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
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
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'isActive'
  }
}, {
  tableName: 'books',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods


Book.prototype.updateRating = async function(newRating) {
  const totalRating = (this.rating * this.ratingCount) + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;
  return await this.save();
};

// Class methods
Book.findByCategory = function(category) {
  return this.findAll({ where: { category, status: 'published', isActive: true } });
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
    order: [['rating', 'DESC'], ['createdAt', 'DESC']]
  });
};

module.exports = Book;
