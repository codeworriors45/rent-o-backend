"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PropertyHasAmenity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Property, { foreignKey: "propertyId" });
      this.belongsTo(models.Amenity, { foreignKey: "amenitiesId" });
    }
  }
  PropertyHasAmenity.init(
    {
      amenitiesId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "amenities",
            schema: "public",
          },
          key: "id",
        },
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
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "property_has_amenities",
      modelName: "PropertyHasAmenity",
    }
  );
  return PropertyHasAmenity;
};
