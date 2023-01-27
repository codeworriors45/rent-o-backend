"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { Province } = models;
      this.belongsTo(Province, { foreignKey: "provinceId" });
    }
  }
  City.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,        
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      provinceId: {
        allowNull: false,
        type: DataTypes.BIGINT,
        references: {
          model: {
              tableName: "pronvinces",
              schema: "public",
          },
          key: "id",
        }
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      deletedAt: DataTypes.DATE 
    },
    {
      sequelize,
      tableName: "cities",
      modelName: "City"
    }
  );
  return City;
};
