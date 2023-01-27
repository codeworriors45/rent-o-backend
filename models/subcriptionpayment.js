'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubcriptionPayment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Property, { foreignKey: "propertyId" });
    }
  };
  SubcriptionPayment.init({
    userId: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
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
      type: DataTypes.FLOAT
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'cad'
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["PENDING", "PROCESSING", "PAID", "UNPAID"],
      defaultValue: "UNPAID",
    },
    payerGatewayMethod: {
      type: DataTypes.STRING
    },
    transactionId: {
      type: DataTypes.STRING
    },
    paymentMethod: {
      type: DataTypes.STRING
    },
    payerGatewayId: {
      type: DataTypes.STRING
    },
    payerEmail: {
      type: DataTypes.STRING
    },
    payerName: {
      type: DataTypes.STRING
    },
    payerAddress: {
      type: DataTypes.JSON
    },
    invoicePrefix: {
      type: DataTypes.STRING
    },
    metaData: {
      type: DataTypes.JSON
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'subcription_payments',
    modelName: 'SubcriptionPayment',
  });
  return SubcriptionPayment;
};