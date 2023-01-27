const {Op} = require('sequelize');
const Validator = require('validatorjs');
const db = require('../../../../models');
const { getOneByKeys } = require("../../../../utils/helpers/dbCommon");

const propertyAddress = {

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

            const propertyAddress = await db.PropertyAddress.findAll({
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
                          deletedAt: {
                            [Op.is]: null,
                          },
                        },
                    },
                    {
                        model: db.City,
                        where: {
                            deletedAt: {
                              [Op.is]: null,
                            },
                        },
                        include: [
                            {
                                model: db.Province,
                                where: {
                                    deletedAt: {
                                      [Op.is]: null,
                                    },
                                  },
                            }
                        ]
                    }
                ],
            });

            if (propertyAddress == null || propertyAddress.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property Address found."
                );
            }

            return apiResponse.success(res, propertyAddress);
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
            cityId: "required|integer",
            street: "required|string",
            latitude: "required|string|min:1|max:20",
            longitude: "required|string|min:1|max:20",
            apt: "string",
            zipCode: "string|min:1|max:10",
            country: "string|min:1|max:50"

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

            const checkProperty= await getOneByKeys(db.Property, {
                id: propertyId,
            });

            if (!checkProperty) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property not found with specific id."
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

            const { 
                cityId, 
                street, 
                latitude, 
                longitude, 
                apt, 
                zipCode, 
                country 
            } = req.body;

            const city= await getOneByKeys(db.City, {
                id: cityId,
            });

            if (!city || city.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "City not found with specific id."
                );
            }

            const propertyAddress = await getOneByKeys(db.PropertyAddress, {
                cityId: cityId,
                propertyId: propertyId,
            });

            if (propertyAddress) {
                return apiResponse.error(
                    res,
                    httpStatusCode.BAD_REQUEST,
                    `Property address already exists`
                );
            }

            const newPropertyAddress = await db.PropertyAddress.create({
                propertyId,
                cityId, 
                street, 
                latitude, 
                longitude, 
                apt, 
                zipCode, 
                country 
            });

            if (!newPropertyAddress || newPropertyAddress?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `New property address is not created.`
                );
            }

            return apiResponse.success(
                res,
                newPropertyAddress,
                httpStatusCode.CREATED
            );
        } 
        catch (error) {
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
            const { propertyAddressId } = req.params;

            if (propertyAddressId == null || propertyAddressId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const propertyAddress = await db.PropertyAddress.findOne({
                where: {
                    id: propertyAddressId,
                    deletedAt: {
                        [Op.is]: null,
                    },
                },
                include: [
                    {
                        model: db.Property,
                        where: {
                          deletedAt: {
                            [Op.is]: null,
                          },
                        },
                    },
                    {
                        model: db.City,
                        where: {
                            deletedAt: {
                              [Op.is]: null,
                            },
                        },
                        include: [
                            {
                                model: db.Province,
                                where: {
                                    deletedAt: {
                                      [Op.is]: null,
                                    },
                                  },
                            }
                        ]
                    }
                ],
            });

            if (!propertyAddress) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property address not found with specific id."
                );
            }

            return apiResponse.success(
                res,
                propertyAddress,
                httpStatusCode.OK,
                "Property address found successfully."
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
            cityId: "required|integer",
            street: "required|string",
            latitude: "required|string|min:1|max:20",
            longitude: "required|string|min:1|max:20",
            apt: "string",
            zipCode: "string|min:1|max:10",
            country: "string|min:1|max:50"
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

            const { 
                cityId, 
                street, 
                latitude, 
                longitude, 
                apt, 
                zipCode, 
                country 
            } = req.body;

            const { propertyAddressId } = req.params;

            if (propertyAddressId == null || propertyAddressId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const propertyAddress = await getOneByKeys(db.PropertyAddress, {
                id: propertyAddressId,
            });

            if (!propertyAddress) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property address not found with specific id."
                );
            }

            const city= await getOneByKeys(db.City, {
                id: cityId,
            });

            if (!city) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "City not found with specific id."
                );
            }

            propertyAddress.cityId = cityId, 
            propertyAddress.street = street, 
            propertyAddress.latitude = latitude, 
            propertyAddress.longitude = longitude, 
            propertyAddress.apt = apt, 
            propertyAddress.zipCode = zipCode, 
            propertyAddress.country = country 
            await propertyAddress.save();

            return apiResponse.success(res, propertyAddress);
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
            const { propertyAddressId } = req.params;

            if (propertyAddressId == null || propertyAddressId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Id can't be empty!"
                );
            }

            const propertyAddress = await getOneByKeys(db.PropertyAddress, {
                id: propertyAddressId,
            });
            if (!propertyAddress) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Property address not found with specific id."
                );
            }

            propertyAddress.deletedAt = new Date();
            await propertyAddress.save();

            return apiResponse.success(res, propertyAddress);
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

module.exports = propertyAddress;