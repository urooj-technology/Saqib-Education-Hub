const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create companies table
    await queryInterface.createTable('companies', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      about: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      logo: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add index
    await queryInterface.addIndex('companies', ['name']);

    // Get unique companies from existing jobs
    const [companies] = await queryInterface.sequelize.query(`
      SELECT DISTINCT company, companyLogo 
      FROM jobs 
      WHERE company IS NOT NULL
    `);

    // Create company records
    const companyMap = new Map();
    for (const companyData of companies) {
      const [company] = await queryInterface.bulkInsert('companies', [{
        name: companyData.company,
        logo: companyData.companyLogo,
        about: `Company profile for ${companyData.company}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true });

      companyMap.set(companyData.company, company.id);
    }

    // Add companyId column to jobs table
    await queryInterface.addColumn('jobs', 'companyId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      }
    });

    // Update existing jobs with companyId
    for (const [companyName, companyId] of companyMap) {
      await queryInterface.sequelize.query(`
        UPDATE jobs 
        SET companyId = ${companyId} 
        WHERE company = '${companyName.replace(/'/g, "''")}'
      `);
    }

    // Make companyId not null after populating data
    await queryInterface.changeColumn('jobs', 'companyId', {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    });

    // Remove old company and companyLogo columns
    await queryInterface.removeColumn('jobs', 'company');
    await queryInterface.removeColumn('jobs', 'companyLogo');
  },

  down: async (queryInterface, Sequelize) => {
    // Add back company and companyLogo columns
    await queryInterface.addColumn('jobs', 'company', {
      type: DataTypes.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('jobs', 'companyLogo', {
      type: DataTypes.STRING(500),
      allowNull: true
    });

    // Get company data and update jobs
    const [jobs] = await queryInterface.sequelize.query(`
      SELECT j.id, c.name as company, c.logo as companyLogo
      FROM jobs j
      JOIN companies c ON j.companyId = c.id
    `);

    for (const job of jobs) {
      await queryInterface.sequelize.query(`
        UPDATE jobs 
        SET company = '${job.company.replace(/'/g, "''")}', 
            companyLogo = ${job.companyLogo ? `'${job.companyLogo.replace(/'/g, "''")}'` : 'NULL'}
        WHERE id = ${job.id}
      `);
    }

    // Remove companyId column
    await queryInterface.removeColumn('jobs', 'companyId');

    // Drop companies table
    await queryInterface.dropTable('companies');
  }
};
