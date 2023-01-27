const { Router } = require('express');
const propertyController = require('../../controllers/v2/property/property.controller');
const propertyAmenityController = require('../../controllers/v2/property/propertyHasAmenity/propertyHasAmenity.controller');
const propertyAddressController = require('../../controllers/v2/property/propertyAddress/propertyAddress.controller');
const bookingController = require('../../controllers/v2/property/booking/booking.controller');
const propertyImageController = require('../../controllers/v2/property/propertyImage/propertyImage.controller')
const propertyFeatueController = require('../../controllers/v2/property/propertyFeature/propertyFeature.controller');

const router = Router();
const { validateJwt } = require("../../middlewares/validateJwt");
const { isAdmin } = require("../../middlewares/isAdmin");
const { validateUser } = require("../../middlewares/validateUser");


router.route("/")
    .get(propertyController.index)
    .post(validateJwt, validateUser, propertyController.store)

router.route("/:id")
    .get(propertyController.show)
    .put(validateJwt, validateUser, propertyController.update)
    .delete(validateJwt, validateUser, propertyController.destroy)

router.route("/:id/approves")
    .put(validateJwt, isAdmin, propertyController.propertyApprove)


/*
*   PropertyHasAmenity Routes
*   params - propertyId, propertyAmenityId
*/

router.route("/:propertyId/property-amenities")
    .get(propertyAmenityController.index)
    .post(validateJwt, validateUser, propertyAmenityController.store)

router.route("/:propertyId/property-amenities/:propertyAmenityId")
    .get(propertyAmenityController.show)
    .put(validateJwt, validateUser, propertyAmenityController.update)
    .delete(validateJwt, validateUser, propertyAmenityController.destroy)


/*
*   PropertyAddress Routes
*   params - propertyId, propertyAddressId
*/

router.route("/:propertyId/property-addresses")
    .get(propertyAddressController.index)
    .post(validateJwt, validateUser, propertyAddressController.store)

router.route("/:propertyId/property-addresses/:propertyAddressId")
    .get(propertyAddressController.show)
    .put(validateJwt, validateUser, propertyAddressController.update)
    .delete(validateJwt, validateUser, propertyAddressController.destroy)

    

/*
*   Booking Routes
*   params - propertyId, bookingId
*/

router.route("/:propertyId/bookings")
    .get(bookingController.index)
    .post(validateJwt, validateUser, bookingController.store)

router.route("/:propertyId/bookings/:bookingId")
    .get(bookingController.show)
    .put(validateJwt, validateUser, bookingController.update)
    .delete(validateJwt, validateUser, bookingController.destroy)


/*
*   Property image Routes
*   params - propertyId, imageId
*/

router.route("/:propertyId/images")
    .get(propertyImageController.index)
    .post(validateJwt, validateUser, propertyImageController.store)

router.route("/:propertyId/images/:imageId")
    .delete(validateJwt, validateUser, propertyImageController.destroy)


router.route("/:propertyId/features")
    .get(validateJwt, validateUser, propertyFeatueController.index)
    .post(validateJwt, validateUser, propertyFeatueController.store)

router.route("/:propertyId/features/:propertyFeatureId")
    .put(validateJwt, validateUser, propertyFeatueController.update)
    .delete(validateJwt, validateUser, propertyFeatueController.destroy)



module.exports = router;