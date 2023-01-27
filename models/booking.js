'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.Property, {foreignKey: "propertyId"});
    }
  };
  Booking.init({
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
      allowNull:false,
      references: {
        model: {
            tableName: "users",
            schema: "public",
        },
        key: "id",
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    startedAt: {
      type: DataTypes.DATE, 
      allowNull: false
    },
    endAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'bookings',
    modelName: 'Booking',
  });
  return Booking;
};