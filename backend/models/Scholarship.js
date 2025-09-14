const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Scholarship extends Model {
  // Instance methods
  async incrementView() {
    this.viewCount += 1;
    await this.save();
  }

  async incrementApplication() {
    this.applicationCount += 1;
    await this.save();
  }

  // Class methods
  static async findByCategory(category, options = {}) {
    const { limit = 12, offset = 0, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    
    return this.findAndCountAll({
      where: { category, status: 'active', isActive: true },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset
    });
  }

  static async search(query, options = {}) {
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
      order: [['createdAt', 'DESC'], ['viewCount', 'DESC']],
      limit,
      offset
    });
  }
}

Scholarship.init({
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
      notEmpty: { msg: 'Title is required' },
      len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Description is required' },
      len: { args: [10, 5000], msg: 'Description must be between 10 and 5000 characters' }
    }
  },
  organization: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Organization is required' }
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  category: {
    type: DataTypes.ENUM(
      'academic',
      'athletic',
      'arts',
      'community_service',
      'leadership',
      'minority',
      'need_based',
      'merit_based',
      'research',
      'study_abroad',
      'graduate',
      'undergraduate',
      'other'
    ),
    allowNull: false,
    defaultValue: 'academic'
  },
  type: {
    type: DataTypes.ENUM(
      'full_tuition',
      'partial_tuition',
      'room_board',
      'books_supplies',
      'travel',
      'stipend',
      'fellowship',
      'grant',
      'loan',
      'other'
    ),
    allowNull: false,
    defaultValue: 'partial_tuition'
  },
  level: {
    type: DataTypes.ENUM(
      'high_school',
      'undergraduate',
      'graduate',
      'phd',
      'postdoc',
      'professional',
      'other'
    ),
    allowNull: false,
    defaultValue: 'undergraduate'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Country is required' }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: { args: [0], msg: 'Amount cannot be negative' }
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD',
    validate: {
      len: { args: [3, 3], msg: 'Currency must be 3 characters' }
    }
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'expired', 'draft'),
    allowNull: false,
    defaultValue: 'active'
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: { msg: 'Deadline must be a valid date' },
      isFuture(value) {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Deadline must be in the future');
        }
      }
    }
  },
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  applicationCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Application count cannot be negative' }
    }
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'View count cannot be negative' }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'isActive'
  }
}, {
  sequelize,
  modelName: 'Scholarship',
  tableName: 'scholarships',
  timestamps: true,
  paranoid: true, // Soft deletes
  indexes: [
    {
      name: 'idx_scholarship_title',
      fields: ['title']
    },
    {
      name: 'idx_scholarship_category',
      fields: ['category']
    },
    {
      name: 'idx_scholarship_type',
      fields: ['type']
    },
    {
      name: 'idx_scholarship_level',
      fields: ['level']
    },
    {
      name: 'idx_scholarship_country',
      fields: ['country']
    },
    {
      name: 'idx_scholarship_status',
      fields: ['status']
    },
    {
      name: 'idx_scholarship_deadline',
      fields: ['deadline']
    },
    {
      name: 'idx_scholarship_author',
      fields: ['author_id']
    },
    {
      name: 'idx_scholarship_created',
      fields: ['created_at']
    },
    {
      name: 'idx_scholarship_is_active',
      fields: ['isActive']
    }
  ],
  hooks: {
    beforeSave: (scholarship) => {
      // Ensure requirements and benefits are arrays
      if (typeof scholarship.requirements === 'string') {
        try {
          scholarship.requirements = JSON.parse(scholarship.requirements);
        } catch (e) {
          scholarship.requirements = [];
        }
      }
      
      if (typeof scholarship.benefits === 'string') {
        try {
          scholarship.benefits = JSON.parse(scholarship.benefits);
        } catch (e) {
          scholarship.benefits = [];
        }
      }
    }
  }
});

module.exports = Scholarship;
