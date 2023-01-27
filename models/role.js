'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.UserRole, {
        foreignKey:{
          name: 'roleId',
          type: DataTypes.BIGINT
        }
      });
    }
  };
  Role.init({    
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    deletedAt: DataTypes.DATE  

  }, {
    sequelize,
    tableName: 'roles',
    modelName: 'Role'
  });
  return Role;
};