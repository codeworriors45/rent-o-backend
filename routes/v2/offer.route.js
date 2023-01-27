const { Router } = require('express');
const { index, store, show, update, destroy } = require('../../controllers/v2/offer/offer.controller');

const router = Router();
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require('../../middlewares/validateUser');


router.route("/")
    .get(index)
    .post(validateJwt,validateUser, store)

router.route("/:id")
    .get(show)
    .put(update)
    .delete(destroy)

module.exports = router;