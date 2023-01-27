"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PropertyFeature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Property, { foreignKey: "propertyId" });
      this.belongsTo(models.Feature, { foreignKey: "featureId" });
    }
  }
  PropertyFeature.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
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
        },
      },
      featureId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "features",
            schema: "public",
          },
          key: "id",
        },
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "property_features",
      modelName: "PropertyFeature",
    }
  );
  return PropertyFeature;
};
