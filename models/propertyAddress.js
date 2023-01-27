'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Property, {foreignKey: "propertyId"});
      this.belongsTo(models.City, {foreignKey: "cityId"});
    }
  };
  PropertyAddress.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    street: {
      allowNull: false,
      type: DataTypes.STRING
    },
    latitude: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    longitude: {
      allowNull: false,
      type: DataTypes.STRING(20)
    },
    apt: {
      allowNull: true,
      type: DataTypes.STRING
    },
    zipCode: {
      allowNull: true,
      type: DataTypes.STRING(10)
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
    cityId:{
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
            tableName: "cities",
            schema: "public",
        },
        key: "id",
      }
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "Canada"
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'property_addresses',
    modelName: 'PropertyAddress'
  });
  return PropertyAddress;
};