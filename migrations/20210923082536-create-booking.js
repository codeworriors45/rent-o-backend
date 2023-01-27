'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
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
        },
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull:false,
        references: {
          model: {
              tableName: "users",
              schema: "public",
          },
          key: "id",
        }
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      startedAt: {
        type: Sequelize.DATE, 
        allowNull: false
      },
      endAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('bookings');
  }
};