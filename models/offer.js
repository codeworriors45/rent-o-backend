'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Property, { foreignKey: "propertyId", as:"property", });  
      this.belongsTo(models.User, { foreignKey: "userId", as:"user", });
      this.belongsTo(models.BuyerSellerContract, {foreignKey: 'contractId'})  

    }
  };
  Offer.init({
    propertyId: {
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: "users",
          schema: "public",
        },
        key: "id",
      },
    },
    preQualified: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    includeItem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false
    },
    offerPrice:{
      type: DataTypes.FLOAT,
      defaultValue: 0.0
    },
    buyerSigningId:{
      type: DataTypes.STRING,
      allowNull: true
    },
    contractId:  {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: {
          tableName: "buyer_seller_contracts",
          schema: "public",
        },
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["REVIEW", "ACCEPTED", "REJECTED"],
      defaultValue: "REVIEW",
    },
    note: DataTypes.STRING,
    expireAt: DataTypes.DATE,
    closeAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE 

  }, {
    sequelize,
    tableName: 'offers',
    modelName: 'Offer',
  });
  return Offer;
};