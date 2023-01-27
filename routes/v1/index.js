const route = require('express').Router();

this.paths = {
    auth: "/auth",
    roles: "/roles",
    users: "/users",
    userAddresses: "/userAddresses",
    userRoles: "/userRoles",
  };

route.use(this.paths.auth, require("./auth"));
route.use(this.paths.roles, require("./roles"));
route.use(this.paths.users, require("./users"));
route.use(this.paths.userAddresses, require("./userAddresses"));
route.use(this.paths.userRoles, require("./userRoles"));

module.exports = route;