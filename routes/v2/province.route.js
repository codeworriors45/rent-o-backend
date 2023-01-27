const { Router } = require('express');
const { index, store, show, update, destroy } = require('../../controllers/v2/property/province.controller');
const { isAdmin } = require('../../middlewares/isAdmin');

const router = Router();
const { validateJwt } = require("../../middlewares/validateJwt");


router.route("/")
    .get(index)
    .post(validateJwt, isAdmin, store)

router.route("/:id")
    .get(show)
    .put(validateJwt, isAdmin, update)
    .delete(validateJwt, isAdmin, destroy)

module.exports = router;