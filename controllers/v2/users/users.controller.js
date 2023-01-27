const { response, request } = require('express');
const bcryptjs = require('bcryptjs');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models'); 
const { getUserById } = require("../../../utils/helpers/dbCommon");
const passwordHelper = require('../../../utils/helpers/passwordHelper');
const queryHelper = require('../../../utils/helpers/queryHelper');
const { getOneByKeys } = require('../../../utils/helpers/queryHelper');
const linkGenerator = require('../../../utils/helpers/linkGenerator');
const imageValidation = require('../../../utils/validation/imageValidation');
const cloudinaryHelper = require('../../../utils/helpers/cloudinaryHelper');

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
        dob: "required|date",
        phoneNumber: "required|string|min:1|max:50",
        image: "string|max:500",
        description:"string|max:500",
        gender: "required|string",
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
        user.email = email;
        user.password = await passwordHelper.hash(password);        
        // user.createdAt = new Date();
        console.log(user.password)


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

const userController = {
    index: async(req,res) => {
        try {

            const { 
                page, 
                limit, 
                verified,
                orderby,
                order,
                type
            } = req.query;

            let tempOrderBy = orderby ? orderby : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit ? limit : 10;
            let tempVerified;
            let orTempVerified;
            let tempUserType;
            let orTempUserType;

            if(!verified || verified == undefined){
                tempVerified = true;
                orTempVerified = false;
            }
            else{
                tempVerified = verified;
                orTempVerified = verified;
            }

            if(!type || type == undefined){
                tempUserType = 'BUYER';
                orTempUserType = 'SELLER';
            }
            else{
                tempUserType = orTempUserType = type ;
            }

            const users = await db.User.findAll({
                where: {
                    [Op.and] : [
                        {
                            verified: {
                                [Op.or]: [tempVerified, orTempVerified]
                            }
                        },
                        {
                            type: {
                                [Op.or]: [tempUserType, orTempUserType]
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false,
                        include:[
                            {
                                model: db.SubcriptionPayment,
                                where: {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                },
                                required: false
                            }
                        ]
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ],
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            })

            const userCount = await db.User.findAll({
                where: {
                    [Op.and] : [
                        {
                            verified: {
                                [Op.or]: [tempVerified, orTempVerified]
                            }
                        },
                        {
                            type: {
                                [Op.or]: [tempUserType, orTempUserType]
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ]
            })
    
            if(!users || users.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found.");
            }

            const link = linkGenerator(
                userCount, 
                `${req.protocol}://${req.headers.host}/v2/users?`, 
                { 
                    page, 
                    limit, 
                    verified,
                    orderby,
                    order,
                    type
                }
            )

            const data = {
                users: users,
                count: userCount.length,
                ...link
            }
    
            return apiResponse.success(res, data, httpStatusCode.OK, "Users found successfully."); 
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
        }
    },

    store: async(req, res = response) => {
    
        let rules = {
            email: "required|email|min:1|max:50",
            password: "required|string|min:1|max:100",
            firstName: "required|string|min:1|max:50",
            lastName: "required|string|min:1|max:50",
            type: "required|in:BUYER,SELLER,ADMIN"
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
    
            let { id, email, password, firstName, lastName, type, gender, dob, phoneNumber, description, createdAt, updatedAt, deletedAt } = req.body;
    
            const userDb = await db.User.findOne({ where: { email: email, deletedAt: { [Op.is] : null}}});
    
            if( userDb ) {
                return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `User ${userDb.email} already exists`);
            }

            //Encrypt password
            password = await passwordHelper.hash(password);
    
    
            const user = await db.User.create({
                firstName, lastName, email, password, type, gender, dob, phoneNumber, description
            });

            let { password: newPassword, ...rest } = user.dataValues;
    
            return apiResponse.success(res, rest, httpStatusCode.CREATED, "User account created successful" );
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
        }
    },

    show: async(req,res) => {
        try {
            const { id } = req.params;
            const user = await queryHelper.checkById(db.User, id);
    
            if( !user ) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
            }
    
            return apiResponse.success(res, user, httpStatusCode.OK, "User found successfully."); 
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    
    },

    update : async(req, res = response) => {

        let rules = {
            firstName: "required|string|min:1|max:50",
            lastName: "required|string|min:1|max:50",
            type: "required|in:BUYER,SELLER,ADMIN"
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
    
            user.updatedAt = new Date();
    
            await userDb.update(user);         
            await userDb.save();
    
            return apiResponse.success(res, userDb); 
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
        }
    },

    updateProfile : async(req, res = response) => {

        let rules = {
            firstName: "required|min:1|max:50",
            lastName: "required|min:1|max:50",
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
    
            const userInfo = req['user'];
            const id = userInfo?.id;      

            const { email, password, type, image, createdAt, updatedAt, deletedAt, ...user } = req.body;
            
            const userDb = await getUserById(id);
            if( ! userDb || userDb.length == 0 ) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
            }

            let tempImage;

            if(image){
                let imgValid = imageValidation.base64(image);
                if(!imgValid) {
                    return apiResponse.error(
                        res,
                        httpStatusCode.UNPROCESSABLE, 
                        "Invalid image"
                    );   
                }

                if(userDb.image?.public_id){
                    await cloudinaryHelper.delete(userDb.image?.public_id)
                }
                let imageUpload = await cloudinaryHelper.upload(image, 'users');
                if(imageUpload.success){
                    tempImage = imageUpload.cloudimg
                }
            }

    
            user.updatedAt = new Date();
    
            await userDb.update({...user, image: tempImage});         
            await userDb.save();
    
            return apiResponse.success(res, userDb, httpStatusCode.OK, 'Updated successfully!'); 
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
        }
    },

    destroy: async(req, res = response) => {

        try {
            const { id } = req.params;
    
            const user = await queryHelper.checkById(db.User, id);
            if( !user ) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.");
            }
    
            user.deletedAt = new Date();
            user.save();
    
            return apiResponse.success(res,user, httpStatusCode.OK, `User deleted successfully`); 
        } 
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER ); 
        }
    },

    verifyUser : async (req, res, next) => {
        try{

            let rules = {
                verified: "required|boolean"
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

            const { id } = req.params;
            const { verified } = req.body;

            const user = await getOneByKeys(db.User, {id: id});

            if(!user || user.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "User not found with specific id.")
            }

            user.verified = verified;
            await user.save();

            return apiResponse.success(res, user, httpStatusCode.OK, `User verified successfully`);

        }
        catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER ); 
        }
    }

}

module.exports = {
    userController,
    getUser,
    getUsers,
    putUser,
    postUser,
    deleteUser
}