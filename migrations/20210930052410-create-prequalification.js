'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('prequalifications', {
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
      applicantIncome: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      coApplicantIncome: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      downpayment: {
        type: Sequelize.FLOAT,
        defaultValue: 0
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
    await queryInterface.dropTable('prequalifications');
  }
};