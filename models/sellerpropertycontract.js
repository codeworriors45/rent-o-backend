"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SellerPropertyContract extends Model {
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
      this.belongsTo(models.Property, {
        foreignKey: "propertyId",
      });
    }
  }
  SellerPropertyContract.init(
    {
      signatureRequestId: DataTypes.STRING,
      signingId: DataTypes.STRING,
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
      propertyId: {
        type: DataTypes.BIGINT,
        references: {
          model: {
            tableName: "properties",
            schema: "public",
          },
          key: "id",
        },
      },
      isSigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isCancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeclined: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      metaData: DataTypes.JSON,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "seller_property_contracts",
      modelName: "SellerPropertyContract",
    }
  );
  return SellerPropertyContract;
};
