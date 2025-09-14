'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('jobs', 'province_ids', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    // Update existing jobs to have province_ids based on their province_id
    await queryInterface.sequelize.query(`
      UPDATE jobs 
      SET province_ids = JSON_ARRAY(province_id) 
      WHERE province_id IS NOT NULL
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('jobs', 'province_ids');
  }
};
