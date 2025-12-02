const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Video = sequelize.define('Video', {
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
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  youtubeUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'youtube_url',
    validate: {
      isUrl: true
    }
  },
  youtubeId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'youtube_id'
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
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count',
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  }
}, {
  tableName: 'videos',
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
      fields: ['author_id']
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
Video.prototype.incrementView = async function() {
  this.viewCount += 1;
  return await this.save();
};

// Extract YouTube ID from URL
Video.prototype.extractYouTubeId = function(url) {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Get YouTube thumbnail URL
Video.prototype.getYouTubeThumbnail = function() {
  if (!this.youtubeId) return null;
  return `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
};

// Get YouTube embed URL
Video.prototype.getYouTubeEmbedUrl = function() {
  if (!this.youtubeId) return null;
  return `https://www.youtube.com/embed/${this.youtubeId}`;
};



// Class methods
Video.findByCategory = function(category) {
  return this.findAll({ 
    where: { 
      category, 
      status: 'published',
      isActive: true
    },
    order: [['createdAt', 'DESC']]
  });
};

Video.findByAuthor = function(authorId) {
  return this.findAll({ 
    where: { 
      authorId, 
      status: 'published',
      isActive: true
    },
    order: [['createdAt', 'DESC']]
  });
};

Video.search = function(query) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ],
      status: 'published',
      isActive: true
    },
    order: [['viewCount', 'DESC'], ['createdAt', 'DESC']]
  });
};

module.exports = Video;
