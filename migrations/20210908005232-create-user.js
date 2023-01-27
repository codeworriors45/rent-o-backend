"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isEmail: {
            msg: "Please enter valid email address",
          },
        },
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        is: /^[0-9a-f]{64}$/i,
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false,
        validate: {
          isAlpha: true,
        },
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      image: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM,
        allowNull: true,
        values: ["MALE", "FEMALE", "OTHER"],
        defaultValue: "MALE",
      },
      type: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: ["BUYER", "SELLER", "ADMIN"],
        defaultValue: "BUYER",
      },
      verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("users");
  },
};
