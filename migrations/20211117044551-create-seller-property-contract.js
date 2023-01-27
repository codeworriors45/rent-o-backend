"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("seller_property_contracts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      signatureRequestId: {
        type: Sequelize.STRING,
      },
      signingId: {
        type: Sequelize.STRING,
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
      propertyId: {
        type: Sequelize.BIGINT,
        references: {
          model: {
            tableName: "properties",
            schema: "public",
          },
          key: "id",
        },
      },
      isSigned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isCancelled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isDeclined: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      metaData: {
        type: Sequelize.JSON,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("seller_property_contracts");
  },
};
