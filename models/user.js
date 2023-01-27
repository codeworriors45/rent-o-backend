"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      const { UserAddress } = models;
      // define association here
      this.hasMany(models.UserRole, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasOne(models.UserAddress, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasOne(models.SellerContract, {
        foreignKey: {
          name: "sellerId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.Booking, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });
      this.hasMany(models.UserHasDocument, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });
      this.hasMany(models.ForgetPassword, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.Prequalification, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });
      this.hasMany(models.SubcriptionPayment, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });
      this.hasMany(models.QualificationDocument, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });
      this.hasMany(models.Property, {
        foreignKey: {
          name: "userId",
          type: DataTypes.BIGINT,
        },
      });

      // Seller only Contracts Against Properties
      this.hasMany(models.SellerPropertyContract, {
        foreignKey: {
          name: "sellerId",
          type: DataTypes.BIGINT,
        },
      });

      // Buyer seller contract
      this.hasMany(models.BuyerSellerContract, {
        foreignKey: {
          name: "sellerId",
          type: DataTypes.BIGINT,
        },
        as: "seller",
      });

      this.hasMany(models.BuyerSellerContract, {
        foreignKey: {
          name: "buyerId",
          type: DataTypes.BIGINT,
        },
        as: "buyer",
      });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Please enter valid email address",
          },
        },
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
        is: /^[0-9a-f]{64}$/i,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      image: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["MALE", "FEMALE", "OTHER"],
        defaultValue: "MALE",
      },
      referenceBy: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["BUYER", "SELLER", "ADMIN"],
        defaultValue: "BUYER",
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );

  User.prototype.toJSON = function () {
    var values = Object.assign({}, this.get());
    delete values.password;
    return values;
  };
  return User;
};
