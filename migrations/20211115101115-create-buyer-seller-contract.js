"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("buyer_seller_contracts", {
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
      buyerId: {
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
      signatureRequestId: {
        type: Sequelize.STRING,
      },
      sellerSignId: {
        type: Sequelize.STRING,
      },
      buyerSignId: {
        type: Sequelize.STRING,
      },
      sellerSignStatus: {
        type: Sequelize.BOOLEAN,
      },
      buyerSignStatus: {
        type: Sequelize.BOOLEAN,
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("buyer_seller_contracts");
  },
};
