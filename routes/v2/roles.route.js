const { Router } = require('express');
const { getRoles, getRole, putRole, postRole, deleteRole } = require('../../controllers/v2/roles/roles.controller');

const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");

const router = Router();

router.get('/', getRoles);

router.get('/:id', getRole);

router.put('/:id', validateJwt, validateUser, putRole);

router.post('/', validateJwt, validateUser, postRole);

router.delete('/:id', validateJwt, validateUser, deleteRole);

module.exports = router;
