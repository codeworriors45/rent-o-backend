const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../models");
const { getOneByKeys } = require("../../../utils/helpers/dbCommon");
const queryHelper = require("../../../utils/helpers/queryHelper");

const amenityController = {
    index : async (req, res, next) => {
        try {
            const amenities = await queryHelper.getAll(db.Amenity);
    
            if (amenities == null || amenities.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No amenities found."
                );
            }
    
            return apiResponse.success(res, amenities);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
    store : async (req, res, next) => {
        let rules = {
            name: "required|string|min:1|max:150",
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
    
            const { name } = req.body;
    
            const amenity = await getOneByKeys(db.Amenity, { name: name });
    
            if (amenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Amenity ${amenity.name} already exists`
                );
            }
    
            const newAmenity = await db.Amenity.create({ name });
    
            if (!newAmenity || newAmenity?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `New amenity is not created.`
                );
            }
    
            return apiResponse.success(res, newAmenity, httpStatusCode.CREATED);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
    show : async (req, res, next) => {
        try {
            const { amenityId } = req.params;
    
            if (amenityId == null || amenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "AmenityId can't be empty!"
                );
            }
    
            const amenity = await getOneByKeys(db.Amenity, { id: amenityId });
    
            if (!amenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Amenity not found with specific id."
                );
            }
    
            return apiResponse.success(
                res,
                amenity,
                httpStatusCode.OK,
                "Amenity found successfully."
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
    update : async (req, res, next) => {
        let rules = {
            name: "required|string|min:1|max:150",
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
                km;
            }
    
            const { amenityId } = req.params;
            const { name } = req.body;
    
            if (amenityId == null || amenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "AmenityId can't be empty!"
                );
            }
    
            const amenity = await getOneByKeys(db.Amenity, { id: amenityId });
    
            if (!amenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Amenity not found with specific id."
                );
            }
    
            amenity.name = name;
            await amenity.save();
    
            return apiResponse.success(res, amenity);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
    destroy : async (req, res, next) => {
        try {
            const { amenityId } = req.params;
    
            if (amenityId == null || amenityId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "AmenityId can't be empty!"
                );
            }
    
            const amenity = await getOneByKeys(db.Amenity, { id: amenityId });
            if (!amenity) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Listing Type not found with specific id."
                );
            }
    
            amenity.deletedAt = new Date();
            await amenity.save();
    
            return apiResponse.success(res, amenity);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    }
}

module.exports = amenityController;
