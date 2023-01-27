"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BuyerSellerContract extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: "sellerId",
        as: "seller",
      });
      this.belongsTo(models.User, {
        foreignKey: "buyerId",
        as: "buyer",
      });
      this.belongsTo(models.Property, {
        foreignKey: "propertyId",
      });
      this.hasOne(models.Offer, {
        foreignKey: {
          name: "contractId",
          type: DataTypes.BIGINT,
        },
      });
    }
  }
  BuyerSellerContract.init(
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
      buyerId: {
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
      signatureRequestId: DataTypes.STRING,
      sellerSignId: DataTypes.STRING,
      buyerSignId: DataTypes.STRING,
      sellerSignStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
      buyerSignStatus: { type: DataTypes.BOOLEAN, defaultValue: false },
      isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
      metaData: DataTypes.JSON,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "BuyerSellerContract",
      tableName: "buyer_seller_contracts",
    }
  );
  return BuyerSellerContract;
};
