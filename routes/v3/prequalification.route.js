const { Router } = require('express');
const prequalificationController = require('../../controllers/v3/prequalification/prequalification.controller');
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require("../../middlewares/validateUser");
const { isAdmin } = require("../../middlewares/isAdmin");

const upload = require('../../middlewares/fileUpload');


const router = Router();

router.route('/')
    .get(validateJwt, validateUser, prequalificationController.index)

router.route("/getall")
        .get(validateJwt, isAdmin, prequalificationController.getAll)

router.route('/:qualificationId')
    .get(validateJwt, isAdmin, prequalificationController.show)
    .put( upload.fields([ { name: "LOE", maxCount: 10 }, { name: "downpaymentDoc", maxCount: 10 }, { name: "CRA", maxCount: 10 }, { name: "CRA1", maxCount: 10 }, { name: "RPS", maxCount: 10 } ]), 
        validateJwt, validateUser, prequalificationController.update)


router.route("/updatebyid/:id")
        .put(validateJwt, isAdmin, prequalificationController.updateById)


router.route("/user-prequalifications/:userId")
    .get(validateJwt, isAdmin, prequalificationController.showByUser);



module.exports = router;
