"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SellerContract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "sellerId",
      });
    }
  }
  SellerContract.init(
    {
      sellerId: {
        type: DataTypes.BIGINT,
        references: {
          model: {
            tableName: "users",
            schema: "public",
          },
          key: "id",
        },
      },
      signingId: DataTypes.STRING,
      signatureRequestId: DataTypes.STRING,
      metaData: DataTypes.JSON,
      isDeclined: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isCancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isSigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "seller_contracts",
      modelName: "SellerContract",
    }
  );
  return SellerContract;
};
