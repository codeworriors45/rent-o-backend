const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../../models");
const { getOneByKeys } = require("../../../../utils/helpers/dbCommon");

const propertyFeature = {
    index: async (req, res, next) => {
        try {
            const { propertyId } = req.params;

            const {
                page, 
                limit,
                orderby,
                order
            } = req.query;
    
            let tempOrderBy = orderby ? orderby : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit > 0 ? limit : 50;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            const propertyCheck = await getOneByKeys(db.Property, {id: propertyId});

            if (propertyCheck == null || propertyCheck === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property can't be found with specific id!"
                );
            }

            const propertyFeatures = await db.PropertyFeature.findAll({
                where: {
                    propertyId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                            deletedAt:{
                                [Op.is]: null
                            }
                        },

                    }, 
                    {
                        model: db.Feature,
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

            if (propertyFeatures == null || propertyFeatures.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property features found."
                );
            }

            const propertyFeaturesCount = await db.PropertyFeature.findAll({
                where: {
                    propertyId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                            deletedAt:{
                                [Op.is]: null
                            }
                        },

                    }, 
                    {
                        model: db.Feature,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    }
                ]
            });

            const data = {
                propertyFeatures: propertyFeatures,
                count: propertyFeaturesCount.length
            }

            return apiResponse.success(res, data, httpStatusCode.OK, 'Features of the property found!');
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    store: async (req, res, next) => {
        let rules = {
            featureId: "required|integer",
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

            const user = req['user'];

            if(user.type == 'BUYER'){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "You dont have any permission add features.")
            }

            const propertyCheck = await getOneByKeys(db.Property, {id: propertyId});

            if (propertyCheck == null || propertyCheck === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property can't be found with specific id!"
                );
            }

            if(user.type == 'SELLER' && user.id != propertyCheck.userId){
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Not your porperty to add features!"
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

            const { featureId } = req.body;

            const propertyFeature = await getOneByKeys(db.PropertyFeature, {
                featureId: featureId,
                propertyId: propertyId,
            });

            if (propertyFeature != null) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Property Feature relation already exists`
                );
            }

            const checkFeature =  await getOneByKeys(db.Feature, {id: featureId});

            if (!checkFeature || checkFeature.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Feature not found with specific id`
                );
            }

            const newPropertyFeature = await db.PropertyFeature.create({
                propertyId,
                featureId,
            });

            if (!newPropertyFeature || newPropertyFeature?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `New property feature is not created.`
                );
            }

            return apiResponse.success(
                res,
                newPropertyFeature,
                httpStatusCode.CREATED
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    show: async (req, res, next) => {
        try {
            const { propertyFeatureId } = req.params;

            if (propertyFeatureId == null || propertyFeatureId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const propertyFeature = await db.PropertyFeature.findOne({
                where: {
                    id: propertyFeatureId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [db.Property, db.Feature],
            });

            if (!propertyFeature) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property feature not found with specific id."
                );
            }

            return apiResponse.success(
                res,
                propertyFeature,
                httpStatusCode.OK,
                "Property feature found successfully."
            );
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    update: async (req, res, next) => {
        let rules = {
            featureId: "required|integer",
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

            const { featureId } = req.body;

            const { propertyFeatureId } = req.params;

            if (propertyFeatureId == null || propertyFeatureId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const checkFeature =  await getOneByKeys(db.Feature, {id: featureId});

            if (!checkFeature || checkFeature.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Feature not found with specific id`
                );
            }

            const propertyFeature = await getOneByKeys(db.PropertyFeature, {
                id: propertyFeatureId,
            });

            if (!propertyFeature) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property Feature not found with specific id."
                );
            }

            propertyFeature.featureId = featureId;
            await propertyFeature.save();

            return apiResponse.success(res, propertyFeature);
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },

    destroy: async (req, res, next) => {
        try {
            const { propertyFeatureId } = req.params;

            if (propertyFeatureId == null || propertyFeatureId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const propertyFeature = await getOneByKeys(db.PropertyFeature, {
                id: propertyFeatureId,
            });
            if (!propertyFeature || propertyFeature.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property feature not found with specific id."
                );
            }

            const property = await getOneByKeys(db.Property, {id: propertyFeature.propertyId});

            const user = req['user'];

            if(user.type == 'BUYER'){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "You dont have any permission add features.")
            }

            if(user.type == 'SELLER' && user.id != property.userId){
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Not your porperty to delete features!"
                );
            }

            propertyFeature.deletedAt = new Date();
            await propertyFeature.save();

            return apiResponse.success(res, propertyFeature, httpStatusCode.OK, 'Property feature deleted.');
        } catch (error) {
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
};

module.exports = propertyFeature;
