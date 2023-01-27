const { Router } = require('express');
const { getUsers, getUser, putUser, postUser, deleteUser, userController } = require('../../controllers/v2/users/users.controller')
const { validateJwt } = require("../../middlewares/validateJwt");
const { isAdmin } = require("../../middlewares/isAdmin");
const { validateUser } = require('../../middlewares/validateUser');

const router = Router();

router.route("/")
    .get(validateJwt, isAdmin, userController.index)
    .post(validateJwt, isAdmin, userController.store)

router.route("/:id")
    .get(validateJwt, isAdmin, userController.show)
    .put(validateJwt, isAdmin, userController.update)
    .delete(validateJwt, isAdmin, userController.destroy)

router.route("/verify/:id")
    .put(validateJwt, isAdmin, userController.verifyUser)



module.exports = router;
