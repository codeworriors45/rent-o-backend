"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn("offers", "contractId", {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: "buyer_seller_contracts",
            schema: "public",
          },
          key: "id",
        },
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([queryInterface.removeColumn("offers", "contractId")]);
  },
};
