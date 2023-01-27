const { Router } = require('express');
const listingTypeController = require('../../controllers/v2/listingType/listingType.controller');
const { isAdmin } = require('../../middlewares/isAdmin');
const { validateJwt } = require('../../middlewares/validateJwt');

const router = Router();

router.route("/")
    .get(listingTypeController.index)
    .post(validateJwt, isAdmin, listingTypeController.store)

router.route("/:listingTypeId")
    .get(listingTypeController.show)
    .put(validateJwt, isAdmin, listingTypeController.update)
    .delete(validateJwt, isAdmin, listingTypeController.destroy)

module.exports = router;