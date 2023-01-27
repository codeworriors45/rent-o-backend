"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("seller_contracts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      sellerId: {
        type: Sequelize.BIGINT,
        references: {
          model: {
            tableName: "users",
            schema: "public",
          },
          key: "id",
        },
      },
      signingId: {
        type: Sequelize.STRING,
      },
      signatureRequestId: {
        type: Sequelize.STRING,
      },
      metaData: {
        type: Sequelize.JSON,
      },
      isDeclined: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isCancelled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isSigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("seller_contracts");
  },
};
