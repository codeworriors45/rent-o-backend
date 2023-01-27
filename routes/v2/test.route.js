const { Router } = require('express');
const { get, store } = require('../../controllers/v2/test/test.controller');
// const {index, show, store, update, destroy} = require('../../controllers/v2/property/listingType/listingType.controller');
const router = Router();
const upload = require('../../middlewares/fileUpload')


router.route("/")
        .get(get)
        // .post(upload.single('img'), store)
        .post(upload.fields([ { name: "img", maxCount: 1 }, { name: "doc", maxCount: 1 } ]), store)
        // .post(upload.fields([{
        //         name: 'audio', maxCount: 1
        // }, {
        //         name: 'graphic', maxCount: 1
        // }]), store)

module.exports = router;
