'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return Promise.all([
      queryInterface.removeColumn('user_addresses', 'latitude'),
      queryInterface.removeColumn('user_addresses', 'longitude'),
      queryInterface.changeColumn(
        'user_addresses', // table name
        'number', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'user_addresses', // table name
        'city', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'user_addresses',
        'province',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'user_addresses',
        'country',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('user_addresses');
     */
     return Promise.all([
      queryInterface.addColumn(
        'user_addresses', // table name
        'latitude', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        'user_addresses', // table name
        'longitude', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.changeColumn(
        'user_addresses', // table name
        'number', // new field name
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.removeColumn('user_addresses', 'city'),
      queryInterface.removeColumn('user_addresses', 'province'),
      queryInterface.removeColumn('user_addresses', 'country'),
    ]);
  }
};
