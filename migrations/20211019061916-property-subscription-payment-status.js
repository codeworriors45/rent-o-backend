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
      queryInterface.addColumn('properties', 'subscriptionStatus', {
          type: Sequelize.ENUM,
          allowNull: false,
          values: ["PENDING", "PROCESSING", "PAID", "UNPAID"],
          defaultValue: "UNPAID",
      }),
    ])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     queryInterface.removeColumn('properties', 'subscriptionStatus');
  }
};
