const { Router } = require('express');
const { login, register, verifyToken, updatePassword, emailVerify, resendEmailVerify } = require('../../controllers/v3/users/auth.controller');
const { userController } = require('../../controllers/v3/users/users.controller')

const router = Router();
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require('../../middlewares/validateUser');


router.post('/login', login);
router.post('/signup', register);
router.get('/verify', emailVerify);
router.post('/verify', verifyToken);
router.post('/update-password', validateJwt, updatePassword);

router.post('/resend-verify', resendEmailVerify);

router.route("/update-profile")
    .put(validateJwt, validateUser, userController.updateProfile);

module.exports = router;