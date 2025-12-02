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
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'article_categories',
      key: 'id'
    },
    field: 'category_id'
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
    allowNull: true,
    field: 'published_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  }
}, {
  tableName: 'articles',
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
      fields: ['published_at']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['status', 'is_active']
    },
    {
      fields: ['category_id', 'status']
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
Article.findByCategory = function(categoryId) {
  return this.findAll({ 
    where: { 
      categoryId, 
      status: 'published',
      isActive: true
    },
    include: [{
      model: require('./ArticleCategory'),
      as: 'category'
    }],
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
        { content: { [Op.like]: `%${query}%` } }
      ],
      status: 'published',
      isActive: true
    },
    order: [['publishedAt', 'DESC']]
  });
};

module.exports = Article;
