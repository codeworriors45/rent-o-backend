const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../models");
const { getOneByKeys } = require("../../../utils/helpers/dbCommon");
const queryHelper = require("../../../utils/helpers/queryHelper");

const index = async (req, res, next) => {
    try {
        const features = await queryHelper.getAll(db.Feature);

        if (features == null || features.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "No feature found."
            );
        }

        return apiResponse.success(res, features);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const store = async (req, res, next) => {
    let rules = {
        name: "required|string|min:1|max:50",
        interior: "required|boolean",
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

        const { name, interior } = req.body;

        const feature = await getOneByKeys(db.Feature, { name: name });

        if (feature) {
            return apiResponse.error(
                res,
                httpStatusCode.BAD_REQUEST,
                `Feature ${feature.name} already exists`
            );
        }

        const newFeature = await db.Feature.create({ name, interior });

        if (!newFeature || newFeature?.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.UNPROCESSABLE,
                `New Feature is not created.`
            );
        }

        return apiResponse.success(res, newFeature, httpStatusCode.CREATED);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const show = async (req, res, next) => {
    try {
        const { featureId } = req.params;

        if (featureId == null || featureId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "featureId can't be empty!"
            );
        }

        const feature = await getOneByKeys(db.Feature, { id: featureId });

        if (!feature) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "Feature not found with specific id."
            );
        }

        return apiResponse.success(
            res,
            feature,
            httpStatusCode.OK,
            "Feature found successfully."
        );
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const update = async (req, res, next) => {
    let rules = {
        name: "required|string|min:1|max:50",
        interior: "required|boolean",
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

        const { featureId } = req.params;
        const { name, interior } = req.body;

        if (featureId == null || featureId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "featureId can't be empty!"
            );
        }

        const feature = await getOneByKeys(db.Feature, { id: featureId });

        if (!feature) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "feature not found with specific id."
            );
        }

        feature.name = name;
        feature.interior = interior;
        await feature.save();

        return apiResponse.success(res, feature);
    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
    }
};

const destroy = async (req, res, next) => {
    try {
        const { featureId } = req.params;

        if (featureId == null || featureId === undefined) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "featureId can't be empty!"
            );
        }

        const feature = await getOneByKeys(db.Feature, { id: featureId });
        if (!feature) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "Listing Type not found with specific id."
            );
        }

        feature.deletedAt = new Date();
        await feature.save();

        return apiResponse.success(res, feature);
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
