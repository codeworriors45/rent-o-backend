'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ListingType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ListingType.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    name: {
      allowNull: false,      
      type: DataTypes.STRING(50)
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedAt: DataTypes.DATE 
  }, {
    sequelize,
    tableName: "listing_types",
    modelName: 'ListingType'
  });
  return ListingType;
};