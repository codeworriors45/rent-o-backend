const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../models");
const { getOneByKeys } = require("../../../utils/helpers/dbCommon");

const index = async (req, res, next) => {
    try {
        const listing = await db.ListingType.findAll({
            where: {
                deletedAt: {
                    [Op.is]: null,
                },
            },
        });

        if (listing == null || listing.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "No listing type found."
            );
        }

        return apiResponse.success(res, listing);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const store = async (req, res, next) => {
    let rules = {
        name: "required|string|min:1|max:50",
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

        const listingType = await db.ListingType.findOne({
            where: { name: name, deletedAt: { [Op.is]: null } },
        });
        if (listingType) {
            return apiResponse.error(
                res,
                httpStatusCode.BAD_REQUEST,
                `Listing Type ${listingType.name} already exists`
            );
        }

        const newListingType = await db.ListingType.create({ name });

        if (!newListingType || newListingType?.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.UNPROCESSABLE,
                `Listing Type is not created.`
            );
        }

        return apiResponse.success(res, newListingType, httpStatusCode.CREATED);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const show = async (req, res, next) => {
    try {
        const { listingTypeId } = req.params;

        if (listingTypeId == null || listingTypeId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "listingTypeId can't be empty!"
            );
        }

        const listingType = await getOneByKeys(db.ListingType, {
            id: listingTypeId,
        });

        if (!listingType) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "listingType not found with specific id."
            );
        }

        return apiResponse.success(
            res,
            listingType,
            httpStatusCode.OK,
            "listingType found successfully."
        );
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const update = async (req, res, next) => {
    let rules = {
        name: "required|string|min:1|max:50",
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

        const { listingTypeId } = req.params;
        const { name } = req.body;

        if (listingTypeId == null || listingTypeId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "listingTypeId can't be empty!"
            );
        }

        const listingType = await getOneByKeys(db.ListingType, {
            id: listingTypeId,
        });

        if (!listingType) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "Listing not found with specific id."
            );
        }

        listingType.name = name;
        await listingType.save();

        return apiResponse.success(res, listingType);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const destroy = async (req, res, next) => {
    try {
        const { listingTypeId } = req.params;

        if (listingTypeId == null || listingTypeId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "listingTypeId can't be empty!"
            );
        }

        const listingType = await getOneByKeys(db.ListingType, {
            id: listingTypeId,
        });
        if (!listingType) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "Listing Type not found with specific id."
            );
        }

        listingType.deletedAt = new Date();
        await listingType.save();

        return apiResponse.success(res, listingType);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

module.exports = {
    index,
    store,
    show,
    update,
    destroy,
};
