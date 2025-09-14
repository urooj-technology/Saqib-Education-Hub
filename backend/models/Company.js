const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
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
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'companies',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    }
  ]
});


// Class methods
Company.search = function(query) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['name', 'ASC']]
  });
};

module.exports = Company;
