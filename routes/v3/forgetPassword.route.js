const { Router } = require('express');
const forgetPassword = require('../../controllers/v3/users/forgetPassword.controller');

const router = Router();

router.route('/')
    .post(forgetPassword.index)
    
router.route('/update')
    .post(forgetPassword.store)

module.exports = router;