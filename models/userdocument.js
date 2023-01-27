'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.UserHasDocument, {
        foreignKey: {
          name: "docId",
          type: DataTypes.BIGINT,
        },
      });
    }
  };
  UserDocument.init({
    docType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sequence: {
      type: DataTypes.INTEGER
    },
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'user_documents',
    modelName: 'UserDocument',
  });
  return UserDocument;
};