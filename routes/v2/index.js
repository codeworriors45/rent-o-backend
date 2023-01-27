const route = require("express").Router();

this.paths = {
    auth: "/auth",
    roles: "/roles",
    users: "/users",
    userAddresses: "/user-addresses",
    userRoles: "/userRoles",
    feature: "/features",
    test: "/tests",
    property: "/properties",
    amenity: "/amenities",
    province: "/provinces",
    city: "/cities",
    offer: "/offers",
    public: "/public",
    userDocs: "/user-documents",
    prequalification: "/prequalifications",
    listingType: "/listing-types",
    forgetPassword: "/forget-password",
    payment: "/payments"
  };

route.use(this.paths.auth, require("./auth.route"));
route.use(this.paths.roles, require("./roles.route"));
route.use(this.paths.users, require("./users.route"));
route.use(this.paths.userAddresses, require("./userAddresses.route"));
route.use(this.paths.userRoles, require("./userRoles.route"));
route.use(this.paths.feature, require("./features.route"));
route.use(this.paths.property, require("./property.route"));
route.use(this.paths.amenity, require("./amenities.route"));
route.use(this.paths.province, require("./province.route"));
route.use(this.paths.city, require("./city.route"));
route.use(this.paths.offer, require("./offer.route"));
route.use(this.paths.public, require("./public.route"));
route.use(this.paths.userDocs, require("./userDocument.route"));
route.use(this.paths.prequalification, require("./prequalification.route"));
route.use(this.paths.listingType, require("./listingType.route"));
route.use(this.paths.forgetPassword, require("./forgetPassword.route"));
route.use(this.paths.payment, require("./payment.route"));


route.use(this.paths.test, require("./test.route"));

module.exports = route;
