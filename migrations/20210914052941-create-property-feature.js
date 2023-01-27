'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_features', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      propertyId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
              tableName: "properties",
              schema: "public",
          },
          key: "id",
        }
      },
      featureId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
              tableName: "features",
              schema: "public",
          },
          key: "id",
        }
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      } 
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_features');
  }
};