const { Router } = require('express');
const publicProperty = require('../../controllers/v3/public/property/publicProperty.controller');
const propertyFilterController = require('../../controllers/v3/public/property/propertyFilter.controller');
const userHasDocumentController = require('../../controllers/v3/public/userHasDocument/userHasDocument.controller');
const publicCityController = require('../../controllers/v3/public/city/publicCity.controller');
const {userController} = require('../../controllers/v3/users/users.controller');
const { validateJwt } = require("../../middlewares/validateJwt");
const { validateUser } = require('../../middlewares/validateUser');

const upload = require('../../middlewares/fileUpload');

const router = Router();

router.get('/properties', validateJwt, validateUser, publicProperty.index);
router.post('/property',upload.fields([ { name: "images", maxCount: 15 } ]), validateJwt, validateUser, publicProperty.store);
router.put('/property/:propertyId', validateJwt, validateUser, publicProperty.update);
router.get('/property/filter', propertyFilterController.filter);
router.get('/property/filter/test', propertyFilterController.test);
router.get('/property/map', propertyFilterController.map);


/* 
    User route
*/

router.route('/users/:id')
    .get(userController.show)


/*
    user documents routes
*/

router.route("/user/:userId/documents")
    .get(userHasDocumentController.index)
    // .post(userHasDocumentController.store)

router.route("/user/:userId/documents/:userDocId")
    .get(userHasDocumentController.show)
    // .put(userHasDocumentController.update)
    .delete(userHasDocumentController.destroy)


/*
    City route
*/

router.route('/find-cities')
    .post(publicCityController.getCity);



module.exports = router;
