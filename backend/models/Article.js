const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Article = sequelize.define('Article', {
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


  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  documentAttachment: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'pending_review'),
    defaultValue: 'draft',
    allowNull: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  readTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
    validate: {
      min: 1
    }
  },
  likeCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  commentCount: {
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
  tableName: 'articles',
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
      fields: ['published_at']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance methods

Article.prototype.incrementLike = async function() {
  this.likeCount += 1;
  return await this.save();
};

Article.prototype.incrementComment = async function() {
  this.commentCount += 1;
  return await this.save();
};

// Class methods
Article.findByCategory = function(category) {
  return this.findAll({ 
    where: { 
      category, 
      status: 'published',
      isActive: true
    },
    order: [['publishedAt', 'DESC']]
  });
};

Article.findByAuthor = function(authorId) {
  const { ArticleAuthor } = require('./index');
  return this.findAll({ 
    include: [{
      model: ArticleAuthor,
      where: { authorId, isActive: true },
      required: true
    }],
    where: { status: 'published', isActive: true },
    order: [['publishedAt', 'DESC']]
  });
};

Article.search = function(query) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        { excerpt: { [Op.like]: `%${query}%` } }
      ],
      status: 'published',
      isActive: true
    },
    order: [['publishedAt', 'DESC']]
  });
};

module.exports = Article;
