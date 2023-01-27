'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     return Promise.all([
      queryInterface.addColumn('properties', 'soldAt', {
          type: Sequelize.DATE,
          allowNull: true
      }),
      queryInterface.addColumn('properties', 'meta', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn('properties', 'meta'),
      queryInterface.removeColumn('properties', 'soldAt'),
    ])
  }
};
