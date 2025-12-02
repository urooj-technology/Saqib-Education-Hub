const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const Job = sequelize.define('Job', {
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
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'job_categories',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    defaultValue: 'full-time',
    allowNull: false
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'provinces',
      key: 'id'
    }
  },
  province_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    get() {
      const value = this.getDataValue('province_ids');
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return [];
        }
      }
      return value || [];
    }
  },
  remote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
    validate: {
      len: [3, 3]
    }
  },
  experience: {
    type: DataTypes.ENUM('entry', 'junior', 'mid-level', 'senior', 'lead', 'executive'),
    defaultValue: 'entry'
  },
  duties_and_responsibilities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  job_requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'expired', 'filled', 'draft'),
    defaultValue: 'active',
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'deadline'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  applicationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  education: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('any', 'male', 'female'),
    defaultValue: 'any'
  },
  contract_type: {
    type: DataTypes.ENUM('permanent', 'temporary', 'contract', 'internship'),
    allowNull: true
  },
  contract_duration: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  contract_extensible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  probation_period: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  number_of_vacancies: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  salary_range: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  years_of_experience: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  submission_guidelines: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  closing_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
}, {
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    {
      fields: ['title']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['province_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['experience']
    },
    {
      fields: ['deadline']
    }
  ]
});

// Instance methods
Job.prototype.incrementView = async function() {
  this.viewCount += 1;
  return await this.save();
};

Job.prototype.incrementApplication = async function() {
  this.applicationCount += 1;
  return await this.save();
};

// Class methods
Job.findByCategory = function(categoryId) {
  return this.findAll({ 
    where: { 
      categoryId, 
      status: 'active' 
    },
    order: [['createdAt', 'DESC']]
  });
};

Job.findByProvince = function(provinceId) {
  return this.findAll({ 
    where: { 
      provinceId, 
      status: 'active' 
    },
    order: [['createdAt', 'DESC']]
  });
};

Job.findByAuthor = function(authorId) {
  return this.findAll({ 
    where: { 
      authorId, 
      status: 'active' 
    },
    order: [['createdAt', 'DESC']]
  });
};

Job.search = function(query) {
  return this.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
        { requirements: { [Op.like]: `%${query}%` } }
      ],
      status: 'active'
    },
    order: [['createdAt', 'DESC'], ['viewCount', 'DESC']]
  });
};

module.exports = Job;
