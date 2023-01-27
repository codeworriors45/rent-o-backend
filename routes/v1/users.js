const { Router } = require('express');
const { getUsers, getUser, putUser, postUser, deleteUser } = require('../../controllers/v1/users')
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");

const router = Router();

router.get('/', getUsers);

router.get('/:id', getUser);

router.put('/:id', validateJwt, validateUser, putUser);

router.post('/', postUser);

router.delete('/:id', validateJwt, validateUser, deleteUser);

module.exports = router;
