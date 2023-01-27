const { response } = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../../../models'); 
const { generateJWT } = require('../../../utils/helpers/generateJwt');
const  { uploadFile: s3Helper, deleteFile }  = require('../../../utils/helpers/s3Helper');
const fs = require('fs')

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
    console.log(req.files);

    /**
     * for single file -> req.file
     * on route upload.single('name')
     * for multiple file with one name
     * upload.array('name', 5)
     */

    let deleteUrl = [{"secure_url":"https://s3.amazonaws.com/renttoownrealty.ca/LOE/LOE_1633685968537.png","key":"LOE/LOE_1633685968537.png"},{"secure_url":"https://s3.amazonaws.com/renttoownrealty.ca/LOE/LOE_1633685968542.png","key":"LOE/LOE_1633685968542.png"}];

    let data = await deleteFile(deleteUrl);
    console.log(data)

    return apiResponse.success(res, data);
}

module.exports = {
    get, store
}