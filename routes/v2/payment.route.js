const { Router } = require('express');
const {payment, success, cancel, index, getUserPayment} = require('../../controllers/v2/payment/payment.controller');

const router = Router();

const { validateJwt } = require("../../middlewares/validateJwt");
const { isAdmin } = require("../../middlewares/isAdmin");
const { validateUser } = require('../../middlewares/validateUser');


router.route('/')
        .post(validateJwt, validateUser, payment)

router.get('/cancel', cancel)
router.get('/success', success)

router.route('/get-payments')
        .get(validateJwt, isAdmin, index);

router.route('/users')
        .get(validateJwt, validateUser, getUserPayment);

module.exports = router;