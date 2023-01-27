const { Router } = require('express');
const { login } = require('../../controllers/v1/auth');

const router = Router();

router.post('/', login);

module.exports = router;
