const { Router } = require("express");
const amenityController = require('../../controllers/v2/amenity/amenity.controller');

const router = Router();

router.route("/")
    .get(amenityController.index)
    .post(amenityController.store)

router.route("/:amenityId")
    .get(amenityController.show)
    .put(amenityController.update)
    .delete(amenityController.destroy)

module.exports = router;