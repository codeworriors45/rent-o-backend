"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("properties", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      plotSize: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      squareFootage: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      price: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      bathroom: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      bedroom: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      partialBathroom: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      listingTypeId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "listing_types",
            schema: "public",
          },
          key: "id",
        },
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "users",
            schema: "public",
          },
          key: "id",
        },
      },
      rule: {
        type: Sequelize.STRING,
      },
      approve: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable("properties");
  },
};
