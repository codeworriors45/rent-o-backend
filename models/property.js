"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.belongsTo(models.ListingType, { foreignKey: "listingTypeId" });

      this.belongsTo(models.User, { foreignKey: "userId" });

      this.hasMany(models.PropertyAddress, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.PropertyHasAmenity, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.PropertyFeature, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.PropertyImage, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.Booking, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.SubcriptionPayment, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      this.hasMany(models.BuyerSellerContract, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });

      // property contract for seller
      this.hasMany(models.SellerPropertyContract, {
        foreignKey: {
          name: "propertyId",
          type: DataTypes.BIGINT,
        },
      });
    }
  }
  Property.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      plotSize: {
        allowNull: false,
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      squareFootage: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      price: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      bathroom: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      bedroom: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      partialBathroom: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      listingTypeId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "listing_types",
            schema: "public",
          },
          key: "id",
        },
      },
      userId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: "users",
            schema: "public",
          },
          key: "id",
        },
      },
      approve: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      subscriptionStatus: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["PENDING", "PROCESSING", "PAID", "UNPAID"],
        defaultValue: "UNPAID",
      },
      rule: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedAt: DataTypes.DATE,
      soldAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      meta: {
        type: DataTypes.TEXT,
        allowNull: true,
        // get: function(){
        //   return JSON.parse(this.getDataValue("meta"))
        // },
        // set: function(value){
        //   return this.setDataValue(JSON.stringify(value))
        // }
      }
    },
    {
      sequelize,
      tableName: "properties",
      modelName: "Property",
    }
  );
  return Property;
};
