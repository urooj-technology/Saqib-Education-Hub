const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scholarship = sequelize.define('Scholarship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
 
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organization: {
    type: DataTypes.STRING(255),
    allowNull: true,
   
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
   
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: true,
    defaultValue: 'USD'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'full_tuition'
  },
  level: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'application_deadline'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'inactive', 'expired'),
    defaultValue: 'draft',
    allowNull: false
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
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'scholarships',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['organization']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status', 'is_active']
    },
    {
      fields: ['author_id']
    },
    {
      fields: ['application_deadline']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['amount']
    },
    {
      fields: ['country']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: (scholarship) => {
      // Parse JSON fields if they are strings
      if (typeof scholarship.benefits === 'string') {
        try {
          scholarship.benefits = JSON.parse(scholarship.benefits);
        } catch (e) {
          scholarship.benefits = [];
        }
      }
    },
    beforeUpdate: (scholarship) => {
      // Parse JSON fields if they are strings
      if (typeof scholarship.benefits === 'string') {
        try {
          scholarship.benefits = JSON.parse(scholarship.benefits);
        } catch (e) {
          scholarship.benefits = [];
        }
      }
    },
    afterFind: (scholarships) => {
      // Parse JSON fields for all found scholarships
      const parseScholarships = (scholarship) => {
        if (typeof scholarship.benefits === 'string') {
          try {
            scholarship.benefits = JSON.parse(scholarship.benefits);
          } catch (e) {
            scholarship.benefits = [];
          }
        }
      };

      if (Array.isArray(scholarships)) {
        scholarships.forEach(parseScholarships);
      } else if (scholarships) {
        parseScholarships(scholarships);
      }
    }
  }
});

// Instance methods - removed viewCount and applicationCount methods since those fields were removed

// Class methods
Scholarship.findByCategory = async function(category, options = {}) {
  const { limit = 12, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
  
  return this.findAndCountAll({
    where: { category, status: 'active', isActive: true },
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit,
    offset
  });
};

Scholarship.search = async function(query, options = {}) {
  const { limit = 12, offset = 0 } = options;
  const { Op } = require('sequelize');
  
  return this.findAndCountAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { organization: { [Op.like]: `%${query}%` } },
        { requirements: { [Op.like]: `%${query}%` } }
      ],
      status: 'active',
      isActive: true
    },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

Scholarship.getFeatured = async function(limit = 6) {
  return this.findAll({
    where: { 
      featured: true, 
      status: 'active', 
      isActive: true 
    },
    order: [['createdAt', 'DESC']],
    limit
  });
};

Scholarship.getByStatus = async function(status, options = {}) {
  const { limit = 12, offset = 0 } = options;
  
  return this.findAndCountAll({
    where: { status, isActive: true },
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

module.exports = Scholarship;