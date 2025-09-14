const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserSubscription = sequelize.define('UserSubscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subscription_plans',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
    defaultValue: 'pending',
    allowNull: false
  },
  jobsPosted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  }
}, {
  tableName: 'user_subscriptions',
  timestamps: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['end_date']
    }
  ]
});

// Instance methods
UserSubscription.prototype.isActive = function() {
  return this.status === 'active' && new Date() <= this.endDate;
};

UserSubscription.prototype.canPostJob = function() {
  if (!this.isActive()) return false;
  
  // If jobLimit is 0, it means unlimited
  if (this.planId === 3) return true; // Enterprise plan
  
  // Check if plan is loaded, if not, we'll need to handle this in the controller
  if (!this.plan) {
    return false; // Plan not loaded, need to handle in controller
  }
  
  return this.jobsPosted < this.plan.jobLimit;
};

UserSubscription.prototype.incrementJobCount = async function() {
  this.jobsPosted += 1;
  return await this.save();
};

module.exports = UserSubscription;
