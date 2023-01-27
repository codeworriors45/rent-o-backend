'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      userId: {
        allowNull: false,      
        type: Sequelize.BIGINT,
        references: {
          model: {
              tableName: "users",
              schema: "public",
          },
          key: "id",
        }
      },
      street: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      number: {
        allowNull: false,
        type: Sequelize.STRING(50)
      },
      latitude: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      longitude: {
        allowNull: false,
        type: Sequelize.STRING(20)
      },
      apt: {
        allowNull: true,
        type: Sequelize.STRING(10)
      },
      zipCode: {
        allowNull: true,
        type: Sequelize.STRING(10)
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
    await queryInterface.dropTable('user_addresses');
  }
};