const { response, request } = require('express');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models'); 
const { getOneByKeys } = require('../../../utils/helpers/dbCommon');
const queryHelper = require('../../../utils/helpers/queryHelper');


const propertyController = {
    index: async(req,res) => {
        try {

            const { 
                approve,
                page, 
                limit,
                orderby,
                order
            } = req.query;
    
            let tempOrderBy = orderby ? orderby : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit ? limit : 50;
            var filter = {};

            if(approve) {
                filter.approve = approve
            }
            filter.deletedAt =  null ;

            const properties = await db.Property.findAll({
                where: filter,
                include: [
                    {
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                    },
                    {
                        model: db.PropertyAddress,
                        where:{
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false,
                        include: [{model: db.City, required: false}]
                    },
                    {
                        model: db.PropertyFeature,
                        where:{
                            deletedAt:{
                                [Op.is]: null
                            },
                        },
                        required: false,
                        include: [db.Feature],
                    },
                    {
                        model: db.PropertyImage,
                        where:{
                            deletedAt:{
                                [Op.is]: null
                            },
                        },
                        required: false
                    },
                    {
                        model: db.ListingType,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ],
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            });

            if(properties == null || properties.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No property found.");
            }

            const propertiesCount = await db.Property.findAll({
                where: filter,
                include: [
                    {
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                    },
                    {
                        model: db.ListingType,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    }
                ]
            });

            const data = {
                properties: properties,
                count: propertiesCount.length
            }
    
            return apiResponse.success(res, data, httpStatusCode.OK, "Property found successfully"); 

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    store: async(req,res) => {
        try {
            let rules = {
                name: "required|string|min:1|max:100",
                description: "required|string",
                squareFootage: "required|numeric",
                price: "required|numeric|min:200000|max:1150000",
                bathroom: "required|numeric",
                bedroom: "required|numeric",
                partialBathroom: "required|numeric",
                listingTypeId: "required|numeric",
                userId: "required|numeric",
                approve: "boolean",
                rule: "string",
            };
        
        
            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            const {userId, listingTypeId} = req.body;

            const user = await getOneByKeys(db.User, {id: userId});

            if(user == null || user.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found with specific id.");
            }

            const listingType = await getOneByKeys(db.ListingType, {id: listingTypeId});

            if(listingType == null || listingType.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No listing type found with specific id.");
            }

            let { id, deletedAt, ...rest } = req.body;

            let property = await db.Property.create(rest);

            return apiResponse.success(res, property, httpStatusCode.CREATED, "Property created successful" );

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }

    },

    show: async(req,res) => {
        try {
            let { id } = req.params;
            const property = await db.Property.findOne({
                where: {
                    id: id,
                    deletedAt: {
                        [Op.is]: null
                    }
                },
                include: [
                    {
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    },
                    {
                        model: db.PropertyAddress,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        include: [
                            {
                                model: db.City,
                                where: {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                },
                                include: [db.Province]
                            }
                        ]
                    },
                    {
                        model: db.PropertyFeature,
                        where:{
                            deletedAt:{
                                [Op.is]: null
                            },
                        },
                        required: false,
                        include: [db.Feature],
                    },
                    {
                        model: db.PropertyImage,
                        where:{
                            deletedAt:{
                                [Op.is]: null
                            },
                        },
                        required: false
                    }
                ]
            });

            if(!property || property.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }
            
            return apiResponse.success(res, property, httpStatusCode.OK, "Property found successfully");

        } catch(error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    update: async(req,res) => {
        try {
            let rules = {
                name: "string|min:1|max:100",
                description: "string",
                plotSize: "numeric",
                squareFootage: "numeric",
                price: "numeric|min:200000|max:1150000",
                bathroom: "numeric",
                bedroom: "numeric",
                partialBathroom: "numeric",
                listingTypeId: "numeric",
                userId: "numeric",
                approve: "boolean",
                rule: "string",
            };

            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            let { id } = req.params;
            let property = await queryHelper.checkById(db.Property, id);

            if(!property) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }

            const {userId, listingTypeId} = req.body;

            const user = await getOneByKeys(db.User, {id: userId});

            if(user == null || user.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found with specific id.");
            }

            const listingType = await getOneByKeys(db.ListingType, {id: listingTypeId});

            if(listingType == null || listingType.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No listing type found with specific id.");
            }

            let { id: pid, createdAt,updatedAt, deletedAt, ...rest } = req.body;

            await property.update(rest);
            await property.save();

            return apiResponse.success(res, property, httpStatusCode.OK, "Property updated successfully");

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    destroy: async(req,res) => {
        try {
            let { id } = req.params;
            let property = await queryHelper.checkById(db.Property, id);

            if(!property) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }
            property.deletedAt = new Date();
            await property.save();
            
            return apiResponse.success(res, property, httpStatusCode.OK, "Property deleted successfully");

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    propertyApprove: async(req, res) => {

        try{
            let rules = {
                approve: "required|boolean"
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
            
            let {id} = req.params;
            let {approve} = req.body;
    
            let property = await queryHelper.checkById(db.Property, id);
    
            if(!property || property.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }
    
            property.approve = approve;
            await property.save();
    
            return apiResponse.success(res, property, httpStatusCode.OK, "Property approved!");
        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }

    },
    togglePropertySoldStatus: async(req, res) => {

        try{
            
            let {id} = req.params;
            let { isRecent, isSold } = req.body;
    
            let property = await queryHelper.checkById(db.Property, id);
    
            if(!property || property.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }
    
            // property.soldAt = property.soldAt ? null : new Date();
            property.soldAt = isSold ? new Date() : null;
            property.meta = property.soldAt ? JSON.stringify({
                status: isRecent ? "RECENTLY_SOLD" : "SOLD"
            }) : JSON.stringify({ status: "NOT_SOLD" })
            console.log("Meta is: ", property.meta);
            await property.save();
    
            return apiResponse.success(res, property, httpStatusCode.OK, "Property updated!");
        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }

    }
}

module.exports = propertyController;