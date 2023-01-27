'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ForgetPassword extends Model {
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
  ForgetPassword.init({
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
    hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'forget_passwords',
    modelName: 'ForgetPassword',
  });
  return ForgetPassword;
};