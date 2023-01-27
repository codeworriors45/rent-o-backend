'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, {foreignKey: 'userId'});
      this.belongsTo(models.Role, {foreignKey: 'roleId'});
    }
  };
  UserRole.init({    
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT,
    },
    userId: {
      type: DataTypes.BIGINT,
      references: {
        model: {
            tableName: "users",
            schema: "public",
        },
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.BIGINT,
      references: {
        model: {
            tableName: "roles",
            schema: "public",
        },
        key: "id",
      },
    },
    deletedAt: DataTypes.DATE  
    }, {
    sequelize,
    tableName: 'user_roles',
    modelName: 'UserRole'
  });
  return UserRole;
};