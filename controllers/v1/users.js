const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../models'); 
const { getUserById } = require("../../utils/helpers/dbCommon");

const getUser = async (req, res = response) => {
    
    try {
        const { id } = req.params;
        const user = await db.User.findByPk(id);

        if( !user ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
        }

        return apiResponse.success(res, user, httpStatusCode.OK, "User found successfully."); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }

}

const getUsers = async (req, res = response) => {
    
    try {
        const users = await db.User.findAll({                    
            where: {
                deletedAt : {
                    [Op.is]: null, 
                }
            }        
        });

        if(users == null || users.length == 0) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No users found.");
        }

        return apiResponse.success(res, users); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const putUser = async(req, res = response) => {

    let rules = {
        email: "email|min:1|max:50",
        password: "string|min:1|max:100",
        firstName: "required|string|min:1|max:50",
        lastName: "required|string|min:1|max:50",
        displayName: "required|string|min:1|max:50",
        birthDate: "required|date",
        phoneNumber: "required|string|min:1|max:50",
        image: "string|max:500",
        description:"string|max:500",
        gender: "required|numeric",
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

        const { id } = req.params;         
        const { email, password, createdAt, updatedAt, deletedAt, ...user } = req.body;
        
        const userDb = await getUserById(id);
        if( ! userDb ) {
             return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
        }

        const userDbWithSameDisplayName = await db.User.findOne({ where: { displayName: user.displayName, id : { [Op.not] : id},deletedAt: { [Op.is] : null}}});
        if( userDbWithSameDisplayName ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `${userDbWithSameDisplayName.displayName} already exists`);
        }
        
        if( password ) {
            //Encrypt password
            const salt = bcryptjs.genSaltSync();
            user.password = bcryptjs.hashSync(password, salt);
        }

        user.updatedAt = new Date();

        userDb.update(user);         
        userDb.save();

        return apiResponse.success(res, userDb); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const postUser = async(req, res = response) => {
    
        
    let rules = {
        email: "required|email|min:1|max:50",
        password: "required|string|min:1|max:100",
        firstName: "required|string|min:1|max:50",
        lastName: "required|string|min:1|max:50",
        displayName: "required|string|min:1|max:50",
        birthDate: "required|date",
        phoneNumber: "required|string|min:1|max:50",
        image: "string|max:500",
        description:"string|max:500",
        gender: "required|numeric",
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

        const { id, email, password, createdAt, updatedAt, deletedAt, ...user } = req.body;
        
        const userDb = await db.User.findOne({ where: { email: email, deletedAt: { [Op.is] : null}}});
        if( userDb ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `User ${userDb.email} already exists`);
        }

        const userDbWithSameDisplayName = await db.User.findOne({ where: { displayName: user.displayName, id : { [Op.not] : id},deletedAt: { [Op.is] : null}}});
        if( userDbWithSameDisplayName ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `${userDbWithSameDisplayName.displayName} already exists`);
        }

        //Encrypt password
        const salt = bcryptjs.genSaltSync();
        user.email = email;
        user.password = bcryptjs.hashSync(password, salt);        
        user.createdAt = new Date();

        const newUser = await db.User.create(user);

        return apiResponse.success(res, newUser, httpStatusCode.CREATED); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const deleteUser = async(req, res = response) => {

    try {
        const { id } = req.params;

        const userDb = await getUserById(id);
        if( !userDb ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
        }

        userDb.deletedAt = new Date();
        userDb.save();

        return apiResponse.success(res,userDb); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

module.exports = {
    getUser,
    getUsers,
    putUser,
    postUser,
    deleteUser
}