'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,        
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      provinceId: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: {
              tableName: "provinces",
              schema: "public",
          },
          key: "id",
        },
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('cities');
  }
};