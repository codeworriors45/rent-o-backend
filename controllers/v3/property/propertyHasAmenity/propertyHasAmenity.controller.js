const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../../models");
const { getOneByKeys } = require("../../../../utils/helpers/dbCommon");

const propertyHasAmenity = {

    index: async (req, res, next) => {
        try {
            const { propertyId } = req.params;
    
            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }
    
            const propertyAmenity = await db.PropertyHasAmenity.findAll({
                where: {
                    propertyId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [db.Property, db.Amenity],
            });
    
            if (propertyAmenity == null || propertyAmenity.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property amenities found."
                );
            }
    
            return apiResponse.success(res, propertyAmenity);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    store: async (req, res, next) => {
        let rules = {
            amenitiesId: "required|integer",
        };
    
        try {
            const { propertyId } = req.params;
    
            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }
    
            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }
    
            const { amenitiesId } = req.body;
    
            const propertyAmenity = await getOneByKeys(db.PropertyHasAmenity, {
                amenitiesId: amenitiesId,
                propertyId: propertyId,
            });
    
            if (propertyAmenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Property amenity relation already exists`
                );
            }
    
            const newpropertyAmenity = await db.PropertyHasAmenity.create({
                propertyId,
                amenitiesId,
            });
    
            if (!newpropertyAmenity || newpropertyAmenity?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `New property amenity relation is not created.`
                );
            }
    
            return apiResponse.success(
                res,
                newpropertyAmenity,
                httpStatusCode.CREATED
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    show: async (req, res, next) => {
        try {
            const { propertyAmenityId } = req.params;
    
            if (propertyAmenityId == null || propertyAmenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }
    
            const propertyAmenity = await db.PropertyHasAmenity.findOne({
                where: {
                    id: propertyAmenityId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [db.Property, db.Amenity],
            });
    
            if (!propertyAmenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property amenity relation not found with specific id."
                );
            }
    
            return apiResponse.success(
                res,
                propertyAmenity,
                httpStatusCode.OK,
                "Property amenity relation found successfully."
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    update : async (req, res, next) => {
        let rules = {
            amenitiesId: "required|integer",
        };
    
        try {
            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }
    
            const { amenitiesId } = req.body;
    
            const { propertyAmenityId } = req.params;
    
            if (propertyAmenityId == null || propertyAmenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }
    
            const propertyAmenity = await getOneByKeys(db.PropertyHasAmenity, {
                id: propertyAmenityId,
            });
    
            if (!propertyAmenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property amenity not found with specific id."
                );
            }
    
            propertyAmenity.amenitiesId = amenitiesId;
            await propertyAmenity.save();
    
            return apiResponse.success(res, propertyAmenity);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
    destroy : async (req, res, next) => {
        try {
            const { propertyAmenityId } = req.params;
    
            if (propertyAmenityId == null || propertyAmenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }
    
            const propertyAmenity = await getOneByKeys(db.PropertyHasAmenity, {
                id: propertyAmenityId,
            });
            if (!propertyAmenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property amenity not found with specific id."
                );
            }
    
            propertyAmenity.deletedAt = new Date();
            await propertyAmenity.save();
    
            return apiResponse.success(res, propertyAmenity);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    }
}

module.exports = propertyHasAmenity;