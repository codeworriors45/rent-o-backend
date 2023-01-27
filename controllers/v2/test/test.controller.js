const { response } = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../../../models'); 
const { generateJWT } = require('../../../utils/helpers/generateJwt');
const  { uploadFile, deleteFile }  = require('../../../utils/helpers/s3Helper');
const fs = require('fs')
const imageValidation = require('../../../utils/validation/imageValidation');
const cloudinaryHelper = require('../../../utils/helpers/cloudinaryHelper');

const get = async (req, res = response) => {

    return apiResponse.error(res, httpStatusCode.BAD_REQUEST, "Test API ");

    const { email, password } = req.body;

    try{
        //Check if user exists
        const userDb = await db.User.findOne({ where: { email: email }});
        if( ! userDb ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
        }

        //Check password
        const isValidPassword = bcryptjs.compareSync(password, userDb.password);
        if( !isValidPassword ){
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, "The email or password is incorrect");
        }

        //Generate JWT
        const token = await generateJWT(userDb.id);

        let object = {
            userDb,
            token
        }
        return apiResponse.success(res, object);
    }
    catch( error ){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const store = async(req,res) => {
    const { image } = req.body;
    const imageUpload = await cloudinaryHelper.upload(image, 'provinces');
    let data = '';
    console.log(imageUpload);
    if(imageUpload.success){
        data = imageUpload.cloudimg
    }
    console.log(data);

    return apiResponse.success(res, data);
}

module.exports = {
    get, store
}