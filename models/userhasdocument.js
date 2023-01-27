'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserHasDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: "userId" });
      this.belongsTo(models.UserDocument, { foreignKey: "docId" });
    }
  };
  UserHasDocument.init({
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
    docId: {
      type: DataTypes.BIGINT,
      allowNull:false,
      references: {
        model: {
            tableName: "user_documents",
            schema: "public",
        },
        key: "id",
      }
    },
    src: {
      type: DataTypes.JSON,
      allowNull: false
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'user_has_documents',
    modelName: 'UserHasDocument',
  });
  return UserHasDocument;
};