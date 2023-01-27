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

        let tempOrderBy = orderby ? orderby : 'sequence';
        let tempOrder = order ? order : 'ASC';
        let tempPage = page > 0 ? page : 1;
        let tempLimit = limit > 0 ? limit : 20;
        let tempQuery = query ? query : '';

        const provinces = await db.Province.findAll({
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
                    [Op.is] : null
                }
            },
            include: [
                {
                    model: db.City,
                    where:{
                        deletedAt:{
                            [Op.is]: null
                        },
                    },
                    required: false
                }
            ],
            order: [
                [tempOrderBy, tempOrder],
                ['id', 'DESC'],
            ],
            offset: (tempPage-1)*tempLimit, 
            limit: tempLimit
        });

        if(!provinces || provinces?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No province found.");
        }

        const provinceCount = await db.Province.count({
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
                    [Op.is] : null
                }
            }
        });

        const data = {
            provinces: provinces,
            count: provinceCount
        }

        return apiResponse.success(res, data, httpStatusCode.OK, "Province found successfully"); 

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

        let { name, code, description, sequence, visible } = req.body;
        
        let previousCode = await db.Province.findOne({
            where: { 
                code, 
                deletedAt: { [Op.is]: null }
            },
        });

        if(previousCode) {
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, `Province code ${code} already exist`);
        }

        let province = await db.Province.create({
            name, code, description, sequence, visible
        });


        return apiResponse.success(res, province, httpStatusCode.CREATED, "Province created successfully"); 

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

        const province = await db.Province.findOne({
            where:{
                id,
                deletedAt:{
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: db.City,
                    where:{
                        deletedAt:{
                            [Op.is]: null
                        },
                    },
                    required: false
                }
            ]
        });

        if(!province || province?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No province found with specific identifer.");
        }

        return apiResponse.success(res, province, httpStatusCode.OK, "Province found successfully"); 

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
        let { name, description, sequence, visible } = req.body;
        
        if(!id) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id not found.");
        }

        let province = await queryHelper.checkById(db.Province, id);

        if(!province || province?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No province found with specific identifer.");
        }

        province.update({ name, description, sequence, visible });
        await province.save();


        return apiResponse.success(res, province, httpStatusCode.OK, "Province found successfully"); 

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

        let province = await queryHelper.checkById(db.Province, id);

        if(!province || province?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No province found with specific identifer.");
        }

        province.deletedAt = new Date();
        await province.save();

        return apiResponse.success(res, province, httpStatusCode.OK, "Province deleted successfully."); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

module.exports = { index, store, show, update, destroy }