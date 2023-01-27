const { response, request } = require('express');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models'); 
const queryHelper = require('../../../utils/helpers/queryHelper');

const index = async(req,res) => {
    try {
        const { 
            query,
            page, 
            limit,
            orderby,
            order
        } = req.query;

        let tempOrderBy = orderby ? orderby : 'createdAt';
        let tempOrder = order ? order : 'DESC';
        let tempPage = page > 0 ? page : 1;
        let tempLimit = limit > 0 ? limit : 50;
        let tempQuery = query ? query : '';

        const cities = await db.City.findAll({
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.iLike]: tempQuery.toLowerCase()+'%'
                        }
                    },
                    {
                        name: {
                            [Op.substring]: tempQuery.toLowerCase()
                        }
                    },
                    {
                        code: {
                            [Op.iLike]: tempQuery.toUpperCase()+'%'
                        }
                    }
                ],
                deletedAt: {
                    [Op.is]: null
                }
            },
            order: [
                [tempOrderBy, tempOrder],
            ],
            offset: (tempPage-1)*tempLimit, 
            limit: tempLimit
        })

        if(!cities || cities?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No city found.");
        }

        const cityCount = await db.City.findAll({
                where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.iLike]: tempQuery.toLowerCase()+'%'
                        }
                    },
                    {
                        name: {
                            [Op.substring]: tempQuery.toLowerCase()
                        }
                    },
                    {
                        code: {
                            [Op.iLike]: tempQuery.toUpperCase()+'%'
                        }
                    }
                ],
                deletedAt: {
                    [Op.is]: null
                }
            }
        });

        const data = {
            cities: cities,
            count: cityCount.length
        }

        return apiResponse.success(res, data, httpStatusCode.OK, "City found successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const store = async(req,res) => {
    try {
        let rules = {
            name: "required|string|min:1|max:100",
            code: "required|string|min:1|max:20",
            description: "string",
            provinceId: "required|numeric",
            sequence: "numeric",
            visible: "required|boolean"
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

        let { name, code, description, provinceId, sequence, visible } = req.body;
        
        name = name.toLowerCase();

        let province = await queryHelper.checkById(db.Province, provinceId);

        if(!province) {
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, `Province id doesn't match.`);
        }

        let previousCode = await queryHelper.getOneByKeys(db.City, { code: code});

        if(previousCode) {
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, `City code ${code} already exist`);
        }

        let city = await db.City.create({
            name, code, description, provinceId, sequence, visible
        });

        return apiResponse.success(res, city, httpStatusCode.CREATED, "City created successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const show = async(req,res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id not found.");
        }

        const city = await db.City.findOne({
            where: {
                id,
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [{model: db.Province, where: {deletedAt: {[Op.is]:null}}}]
        });

        if(!city || city?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No city found with specific identifer.");
        }

        return apiResponse.success(res, city, httpStatusCode.OK, "City found successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const update = async(req,res) => {
    try {
        let rules = {
            name: "string|min:1|max:100",
            description: "string",
            provinceId: "numeric",
            sequence: "numeric",
            visible: "boolean"
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

        const { id } = req.params;
        let { name, description, provinceId, sequence, visible } = req.body;

        name = name.toLowerCase();

        if(!id) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id not found.");
        }

        let city = await queryHelper.checkById(db.City, id);

        if(!city || city?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No city found with specific identifer.");
        }

        city.update({ name, description, provinceId, sequence, visible });
        await city.save();


        return apiResponse.success(res, city, httpStatusCode.OK, "City found successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const destroy = async(req,res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id not found.");
        }

        let city = await queryHelper.checkById(db.City, id);

        if(!city || city?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No city found with specific identifer.");
        }

        city.deletedAt = new Date();
        await city.save();

        return apiResponse.success(res, city, httpStatusCode.OK, "City deleted successfully."); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

module.exports = { index, store, show, update, destroy }