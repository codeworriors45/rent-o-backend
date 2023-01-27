'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {foreignKey: "userId"})
    }
  };
  UserAddress.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    userId: {
      allowNull: false,      
      type: DataTypes.BIGINT,
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
      type: DataTypes.STRING(50)
    },
    number: {
      allowNull: true,
      type: DataTypes.STRING
    },
    city: {
      allowNull: true,
      type: DataTypes.STRING
    },
    province: {
      allowNull: true,
      type: DataTypes.STRING
    },
    country: {
      allowNull: true,
      type: DataTypes.STRING
    },
    apt: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    zipCode: {
      allowNull: true,
      type: DataTypes.STRING(10)
    },
    deletedAt: DataTypes.DATE 
  }, {
    sequelize,
    tableName: "user_addresses",
    modelName: 'UserAddress'
  });
  return UserAddress;
};