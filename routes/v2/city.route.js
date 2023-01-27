const { Router } = require('express');
const { index, store, show, update, destroy } = require('../../controllers/v2/property/city.controller');

const router = Router();
const { validateJwt } = require("../../middlewares/validateJwt");


router.route("/")
    .get(index)
    .post(store)

router.route("/:id")
    .get(show)
    .put(update)
    .delete(destroy)

module.exports = router;