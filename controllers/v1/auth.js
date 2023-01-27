const { response } = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../../models'); 
const { generateJWT } = require('../../utils/helpers/generateJwt');

const login = async (req, res = response) => {

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

module.exports = {
    login
}