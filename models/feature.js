"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.PropertyFeature, {
        foreignKey: {
          name: "featureId",
          type: DataTypes.BIGINT,
        },
      });
    }
  }
  Feature.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING(50),
      },
      interior: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "features",
      modelName: "Feature",
    }
  );
  return Feature;
};
