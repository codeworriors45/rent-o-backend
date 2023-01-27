'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QualificationDocument extends Model {
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
  QualificationDocument.init({
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
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    src: {
      type: DataTypes.JSON,
    },
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    tableName: 'qualification_documents',
    modelName: 'QualificationDocument',
  });
  return QualificationDocument;
};