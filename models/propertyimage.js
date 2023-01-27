'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Property, { foreignKey: "propertyId" });  
    }
  };
  PropertyImage.init({
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
    src: {
      type: DataTypes.JSON,
      allowNull: false
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'property_images',
    modelName: 'PropertyImage',
  });
  return PropertyImage;
};