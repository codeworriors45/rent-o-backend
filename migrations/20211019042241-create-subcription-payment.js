'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subcription_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
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
      amount: {
        type: Sequelize.FLOAT
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'cad'
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["PENDING", "PROCESSING", "PAID", "UNPAID"],
        defaultValue: "UNPAID",
      },
      payerGatewayMethod: {
        type: Sequelize.STRING
      },
      transactionId: {
        type: Sequelize.STRING
      },
      paymentMethod: {
        type: Sequelize.STRING
      },
      payerGatewayId: {
        type: Sequelize.STRING
      },
      payerEmail: {
        type: Sequelize.STRING
      },
      payerName: {
        type: Sequelize.STRING
      },
      payerAddress: {
        type: Sequelize.JSON
      },
      invoicePrefix: {
        type: Sequelize.STRING
      },
      metaData: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('subcription_payments');
  }
};