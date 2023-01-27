'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Prequalification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
    }
  };
  Prequalification.init({
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
    applicantIncome: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    coApplicantIncome: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    downpayment: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["PENDING", "PROCESSING", "APPROVED", "REJECTED"],
      defaultValue: "PENDING",
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: "prequalifications",
    modelName: 'Prequalification',
  });
  return Prequalification;
};