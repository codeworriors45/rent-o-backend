const { response } = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../../../models'); 
const { generateJWT } = require('../../../utils/helpers/generateJwt');
const passwordHelper = require('../../../utils/helpers/passwordHelper');
const user = require('../../../models/user');
const Validator = require("validatorjs");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const queryHelper = require('../../../utils/helpers/queryHelper');
const WelcomeUserMail = require('../../../utils/mails/service/welcome-user');
const generateHash = require('../../../utils/helpers/generateHash');
const { getOneByKeys } = require('../../../utils/helpers/dbCommon');
const emailVerifyhtml = require('../../../utils/htmlTemplate/emailVerificationThank');
const invalidLinkHtml = require('../../../utils/htmlTemplate/invalidLink');


const login = async (req, res = response) => {

    const { email, password } = req.body;

    let rules = {
        email: "required|email|min:1|max:50",
        password: "required|string|min:1|max:100"
    };


    const validation = new Validator(req.body, rules);
    if (validation.fails()) {
        return apiResponse.errorWithData(
            res,
            validation.errors.all(),
            422,
            "Validation Error"
        );
    }

    try{
        //Check if user exists
        const userDb = await db.User.findOne({ 
            where: { 
                email: email,
                deletedAt: {
                    [Op.is] : null
                } 
            }
        });

        if( ! userDb ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "The email or password is incorrect.");
        }

        //Check password
        const isValidPassword = await passwordHelper.compare(password, userDb.password);
        
        if( !isValidPassword ){
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, "The email or password is incorrect");
        }

        let userOb = {
            id: userDb.id,
            type: userDb.type
        }
        const { password: tempPasword, ...rest } = userDb.dataValues;
        //Generate JWT
        const token = await generateJWT(userOb);

        let object = {
            token,
            user: rest
        }
        return apiResponse.success(res, object, httpStatusCode.OK, "Login successful" );
    }
    catch( error ){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const register = async(req, res = response) => {
    let rules = {
        email: "required|email|min:1|max:50",
        password: "required|string|min:1|max:100",
        firstName: "required|string|min:1|max:50",
        lastName: "required|string|min:1|max:50",
        type: "required|in:BUYER,SELLER,ADMIN",
        gender: "required"
    };

    try {

        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            return apiResponse.errorWithData(
                res,
                validation.errors.all(),
                422,
                "Validation Error"
            );
        }

        let { id, email, password, firstName, lastName, dob, gender, phoneNumber, description, type, createdAt, updatedAt, deletedAt } = req.body;

        const userDb = await db.User.findOne({ where: { email: email, deletedAt: { [Op.is] : null}}});

        if( userDb ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `User ${userDb.email} already exists`);
        }

        //Encrypt password
        password = await passwordHelper.hash(password);

        const user = await db.User.create({
            firstName, lastName, email, password, type, dob, gender, description, phoneNumber
        });

        if(!user.dataValues) {
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, "User can not be registered."); 
        }

        // creating empty row for pre-qualification
        const qualification = await db.Prequalification.create({
            userId: user.dataValues.id
        });

        let userOb = {
            id: user.id,
            type: user.type
        }

        const date = Date.now() + (3*24*3600*1000);

        let hash = await passwordHelper.hash(`${email}##${date}`)

        let link = `${req.protocol}://${req.headers.host}/v2/auth/verify?i=${user.id}&h=${hash}&t=${date}`

        WelcomeUserMail(email, link, `${user.firstName} ${user.lastName}`)

        const { password: tempPasword, ...rest } = user.dataValues;
        //Generate JWT
        const token = await generateJWT(userOb);

        return apiResponse.success(res, {token, user: rest}, httpStatusCode.CREATED, "Registration successful" );
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const updatePassword = async(req, res = response) => {
    try {
        let rules = {
            oldPassword: "required|string|min:1|max:100",
            password: "required|string|min:1|max:100"
        }; 
        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
            return apiResponse.errorWithData(
                res,
                validation.errors.all(),
                422,
                "Validation Error"
            );
        }

        let { oldPassword, password } = req.body;
        let { id } = req.user;
        let user = await queryHelper.checkById(db.User, id);
        
        //Check password
        const isValidPassword = await passwordHelper.compare(oldPassword, user.password);

        if( !isValidPassword ){
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, "Given password are incorrect");
        }

        password = await passwordHelper.hash(password);       
        user.password = password;
        await user.save();

        return apiResponse.success(res, user, httpStatusCode.OK, "New Password updated");


    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const verifyToken = async(req,res = response) => {
    try {
        var { authorization:token } = req.headers;

        if(!token || token === null || token === undefined) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No token found!");
        }

        var decode = await jwt.verify(token, process.env.JWT_SECRETKEY);
        
        var now = Math.floor(Date.now() / 1000);

        if( now > decode?.exp) {
            return apiResponse.errorWithData(res, decode, httpStatusCode.UNPROCESSABLE, "Token expired");
        }

        var id = decode?.id;
        var users = await db.User.findOne({
            where: {
                id,
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [db.UserAddress]
        });

        if( users === null || users === undefined || users?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with this specefic id.");
        }

        const { password, ...rest } = users.dataValues;          

        // let success = {
        //     status_code: httpStatusCode.OK,
        //     message: "Token verified.",
        //     data: rest
        // }

        return apiResponse.success(res, rest, httpStatusCode.OK, 'Token verified');
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, "Invalid token.");
    }

}

const emailVerify = async (req, res, next) => {
    try{

        const {i, h, t} = req.query;

        if(t<Date.now()){
            return res.redirect(`${process.env.FRONTEND_LINK}/account-verification?status=expired`);
        }

        const user = await getOneByKeys(db.User, {id: i});

        if(!user || user.length == 0){
            // return res.send(invalidLinkHtml);
            return res.redirect(`${process.env.FRONTEND_LINK}/account-verification?status=failed`);
        }

        const hash = await passwordHelper.compare(`${user.email}##${t}`, h);

        if(!hash){
            return res.redirect(`${process.env.FRONTEND_LINK}/account-verification?status=failed`);
        }

        user.verified = true;
        await user.save();

        // return res.send(emailVerifyhtml(user.firstName, user.lastName))
        return res.redirect(`${process.env.FRONTEND_LINK}/account-verification?status=success`);

        
    }catch(error){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
}

const resendEmailVerify = async (req, res, next) => {
    try{

        const { email } = req.body

        const user = await getOneByKeys(db.User, {email: email});

        if(!user || user.length == 0){
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found.");
        }

        if(user.verified == true){
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, "Already verified.");
        }

        const date = Date.now() + (3*24*3600*1000);

        let hash = await passwordHelper.hash(`${user.email}##${date}`)

        let link = `${req.protocol}://${req.headers.host}/v2/auth/verify?i=${user.id}&h=${hash}&t=${date}`

        WelcomeUserMail(user.email, link, `${user.firstName} ${user.lastName}`)

        return apiResponse.success(res, {}, httpStatusCode.OK, 'Verification mail has been sent', );

    }catch(error){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
}


module.exports = {
    login,
    register,
    verifyToken,
    updatePassword,
    emailVerify,
    resendEmailVerify
}