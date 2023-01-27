'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      apt: {
        allowNull: true,
        type: Sequelize.STRING
      },
      street: {
        allowNull: false,
        type: Sequelize.STRING
      }, 
      latitude: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      longitude: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      zipCode: {
        allowNull: true,
        type: Sequelize.STRING(10)
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
      cityId:{
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
              tableName: "cities",
              schema: "public",
          },
          key: "id",
        }
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: "Canada"
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
    await queryInterface.dropTable('property_addresses');
  }
};