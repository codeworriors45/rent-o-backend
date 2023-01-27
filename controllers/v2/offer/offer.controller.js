const { response, request } = require('express');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models'); 
const { getOneByKeys } = require('../../../utils/helpers/queryHelper');
const queryHelper = require('../../../utils/helpers/queryHelper');


const index = async(req,res) => {
    try {
        const { 
            page, 
            limit,
            orderby,
            order
        } = req.query;

        let tempOrderBy = orderby ? orderby : 'createdAt';
        let tempOrder = order ? order : 'DESC';
        let tempPage = page > 0 ? page : 1;
        let tempLimit = limit ? limit : 10;

        const offers = await db.Offer.findAll({
            where: {
                deletedAt: {
                    [Op.is] : null
                }
            },
            include: [
                {
                    model: db.Property,
                    as:"property",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
                {
                    model: db.User,
                    as:"user",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
            ],
            order: [
                [tempOrderBy, tempOrder],
            ],
            offset: (tempPage-1)*tempLimit, 
            limit: tempLimit
        });

        if(!offers || offers?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No offer found.");
        }

        const count = await db.Offer.findAll({
            where: {
                deletedAt: {
                    [Op.is] : null
                }
            },
            include: [
                {
                    model: db.Property,
                    as:"property",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
                {
                    model: db.User,
                    as:"user",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
            ]
        });

        
        const data = {
            offers : offers,
            count : count.length
        }

        return apiResponse.success(res, data, httpStatusCode.OK, "Offer found successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const store = async(req,res) => {
    try {
        
        let rules = {
            propertyId: "required|numeric",
            includeItem: "required|string",
            condition: "required|string",
            note: "string",
            expireAt: "date",
            closeAt: "date"
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
        /**
         * remove this after adding middleware. user id shoud come from token
         */
         const userInfo = req['user'];
         const userId = userInfo?.id;

         const user = await getOneByKeys(db.User, {id: userInfo.id});

         if(user.verified == false){
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, "The user is not eligible to make offer!");
         }

        let { propertyId, includeItem, condition, note, expireAt, closeAt } = req.body;

        let previousOffer = await db.Offer.findOne({
            where: { 
                propertyId,
                userId,
                deletedAt: { 
                    [Op.is]: null
                }
            },
        });

        if(previousOffer) {
            return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, "The user already offered once!");
        }

        let offer = await db.Offer.create({
            propertyId, userId, preQualified : user.verified , includeItem, condition, note, expireAt, closeAt
        });


        return apiResponse.success(res, offer, httpStatusCode.CREATED, "Offer placed successfully"); 

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

        const offer = await db.Offer.findAll({
            where: {
                id,
                deletedAt: {
                    [Op.is] : null
                }
            },
            order: [
                ['id','asc']
            ],
            include: [
                {
                    model: db.Property,
                    as:"property",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
                {
                    model: db.User,
                    as:"user",
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                },
            ]
        });

        if(!offer || offer?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No offer found with specific identifer.");
        }

        return apiResponse.success(res, offer, httpStatusCode.OK, "Offer found successfully"); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const update = async(req,res) => {
    try {
        let rules = {
            preQualified: "boolean",
            includeItem: "string",
            condition: "string",
            note: "string",
            expireAt: "date",
            closeAt: "date"
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
        let { preQualified, includeItem, condition, note, expireAt, closeAt } = req.body;

        if(!id) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id not found.");
        }

        let offer = await queryHelper.checkById(db.Offer, id);

        if(!offer || offer?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No offer found with specific identifer.");
        }
        let updatedAt = offer.updatedAt;

        offer.update({ preQualified, includeItem, condition, note, expireAt, closeAt });
        await offer.save();

        if(offer.updatedAt === updatedAt) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "You need to specify any different value to update.");
        }

        return apiResponse.success(res, offer, httpStatusCode.OK, "Offer updated successfully"); 

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

        let offer = await queryHelper.checkById(db.Offer, id);

        if(!offer || offer?.length == 0 ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No offer found with specific identifer.");
        }

        offer.deletedAt = new Date();
        await offer.save();

        return apiResponse.success(res, offer, httpStatusCode.OK, "Offer deleted successfully."); 

    } catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

module.exports = { index, store, show, update, destroy }