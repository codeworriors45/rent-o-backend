const {Op} = require('sequelize');
const Validator = require('validatorjs');
const db = require('../../../../models');
const {getOneByKeys, getAllByKeys} = require('../../../../utils/helpers/dbCommon');
const imageValidation = require('../../../../utils/validation/imageValidation');
const cloudinaryHelper = require('../../../../utils/helpers/cloudinaryHelper');
const linkGenerator = require('../../../../utils/helpers/linkGenerator');
const fs = require('fs');
const  { uploadFile, deleteFile }  = require('../../../../utils/helpers/s3Helper');

const getIntArray = (str) => {
    return str.split(',').map(function(item) {
        return parseInt(item);
    });
}

const publicProperty = {
    index: async (req, res, next) => {
        try{

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

            const user = req['user'];
            const properties = await db.Property.findAll({
                where: {
                    userId: user.id,
                    deletedAt: {
                        [Op.is]: null
                    }
                },
                include: [
                    {
                        model: db.PropertyAddress,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        include:[db.City]
                    },
                    {
                        model: db.PropertyImage,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ],
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            });

            if (properties == null || properties.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property found."
                );
            }

            const propertyCount= await db.Property.findAll({
                where: {
                    userId: user.id,
                    deletedAt: {
                        [Op.is]: null
                    }
                },
                include: [
                    {
                        model: db.PropertyAddress,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        include:[db.City]
                    },
                    {
                        model: db.PropertyImage,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false
                    }
                ]
            });

            const link = linkGenerator(
                propertyCount.length, 
                `${req.protocol}://${req.headers.host}/v2/public/properties?`, 
                { 
                    tempPage, 
                    limit,
                    orderby,
                    order
                }
            )

            const data = {
                properties: properties,
                count: propertyCount.length,
                ...link
            }

            return apiResponse.success(res, data, httpStatusCode.OK, "Property found successfully."); 
        }catch(error){
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },
    store: async ( req, res, next ) => {
        const t = await db.sequelize.transaction();

        try{
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
                rule: "string",

                street: "required|string",
                latitude: "required|string|min:1|max:20",
                longitude: "required|string|min:1|max:20",
                apt: "string",
                zipCode: "string|min:1|max:10",
                country: "string|min:1|max:50",

                cityId: "required|integer",

                signingId: "string"
            };

            let propertyFeatures = [];

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
                name, description, plotSize, squareFootage, price, bathroom, bedroom,
                partialBathroom, listingTypeId, userId, rule, 
                street, latitude, longitude, apt, zipCode, country, 
                featureIds,
                cityId, signingId
            } = req.body;

            const validUser = req['user'];
            let files = req.files;

            if(validUser.type=='SELLER' && validUser.id != userId){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Invalid user id.")
            }

            if(validUser.type != 'SELLER' && validUser.type != 'ADMIN'){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "You dont have any permission to list property.")
            }

            const checkUser = await getOneByKeys(db.User, {id: userId});

            if(checkUser == null || checkUser.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found with specific id.");
            }

            const checkListingType = await getOneByKeys(db.ListingType, {id: listingTypeId});

            if(checkListingType == null || checkListingType.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No listing type found with specific id.");
            }

            const checkCity= await getOneByKeys(db.City, {
                id: cityId,
            });

            if (!checkCity || checkCity.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "City not found with specific id."
                );
            }

            let tempFeaturesIds;
            if(typeof(featureIds) == 'string'){
                tempFeaturesIds = JSON.parse(featureIds)
            }else{
                tempFeaturesIds = featureIds;
            }

            const features = await db.Feature.findAll({
                where: {
                    id: tempFeaturesIds,
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            })

            if(!features || features.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Feature not found with specific ids.")
            }
            
            const property = await db.Property.create({
                name, description, plotSize, squareFootage, price, bathroom, bedroom,
                partialBathroom, listingTypeId, userId, rule,
            }, { transaction: t });

            await Promise.all(features.map(item => {
                propertyFeatures.push({
                    propertyId: property.id,
                    featureId: item.id
                })
            }));

            const createdPropertyFeatures = await db.PropertyFeature.bulkCreate(
                propertyFeatures,
                {transaction: t}
            );

            const newPropertyAddress = await db.PropertyAddress.create({
                propertyId: property.id,
                cityId: parseInt(cityId), 
                street, latitude, longitude, apt, zipCode, country
            }, { transaction: t });

            await t.commit();

        
            // Add signingId and connect propertyId over here
            if(signingId){
                
                console.log(`Signing id is ${signingId}`);
                
                // retrieve existing 
                const contract = await db.SellerPropertyContract.findOne({
                    where: {
                        signingId: signingId
                    }
                });

                if(contract){
                    contract.propertyId = property.id;
                    await contract.save();
                    console.log(`SellerContract ${contract.id} has been connected to Property ${property.id}`);
                }
            }


            let propertyImages;
            
            try{
                let imgArr = [];
    
                await Promise.all(
                    await files?.images?.map(async (file) => {
                        const f = fs.readFileSync(file.path);
                        const res = await uploadFile(f, file.filename, 'images');
    
                        if(res.success) {
                            imgArr.push({
                                propertyId: property.id,
                                src: res.data
                            });
                        }
                        fs.unlinkSync(file.path);
                    }) ?? []
                );
    
                propertyImages = await db.PropertyImage.bulkCreate(imgArr);
            }catch(error){
                console.log(error)
            }

            try{

                const data = {
                    property: property.dataValues,
                    propertyAddress: newPropertyAddress.dataValues,
                    propertyImages: propertyImages,
                    propertyHasFeatures: createdPropertyFeatures
                }

                return apiResponse.success(
                    res, 
                    data, 
                    httpStatusCode.CREATED, 
                    "Property listing created successfully" 
                );
            }catch(error){
                console.log(error);
                return apiResponse.error(
                    res,
                    httpStatusCode.INTERNAL_SERVER,
                    error
                );
            }

        }catch (error) {
            await t.rollback();
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },

    update: async (req, res, next ) => {
        const t = await db.sequelize.transaction();
        try{
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
                rule: "string",

                street: "required|string",
                latitude: "required|string|min:1|max:20",
                longitude: "required|string|min:1|max:20",
                apt: "string",
                zipCode: "string|min:1|max:10",
                country: "string|min:1|max:50",

                cityId: "required|integer",
            };

            let propertyAmenity = [];

            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            const { propertyId } = req.params;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            const {
                name, description, plotSize, squareFootage, price, bathroom, bedroom,
                partialBathroom, listingTypeId, userId, rule, 
                street, latitude, longitude, apt, zipCode, country,
                cityId
            } = req.body;

            const validUser = req['user'];

            if(validUser.type=='SELLER' && validUser.id != userId){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Invalid user id.")
            }

            if(validUser.type != 'SELLER' && validUser.type != 'ADMIN'){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "You dont have any permission to update property.")
            }

            const property = await getOneByKeys(db.Property, {id: propertyId});
            if(!property) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found with specific id.")
            }

            const checkUser = await getOneByKeys(db.User, {id: userId});

            if(checkUser == null || checkUser.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found with specific id.");
            }

            const checkListingType = await getOneByKeys(db.ListingType, {id: listingTypeId});

            if(checkListingType == null || checkListingType.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No listing type found with specific id.");
            }

            const checkCity= await getOneByKeys(db.City, {
                id: cityId,
            });

            if (!checkCity || checkCity.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "City not found with specific id."
                );
            }

            const updatedProperty = await db.Property.update({
                    name, description, plotSize, squareFootage, price, bathroom, bedroom,
                    partialBathroom, listingTypeId, userId, rule,
                },
                {
                    where: {
                        id: propertyId,
                        deletedAt: {
                            [Op.is]: null,
                        }
                    }
                },
                { transaction: t }
            );

            const updatedPropertyAddress = await db.PropertyAddress.update({
               cityId, street, latitude, longitude, apt, zipCode, country
            },
            {
                where: {
                    propertyId,
                    deletedAt: {
                        [Op.is]: null,
                    }
                }
            },
            {transaction: t });

            t.commit();

            try{
                
                const newPropertyInfo = await db.Property.findOne({
                    where: {
                        id: propertyId,
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                    include: [
                        {
                            model: db.PropertyAddress,
                            where: {
                              deletedAt: {
                                [Op.is]: null,
                              }
                            },
                            include: [
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
                            ]
                        },
                        {
                            model: db.PropertyImage,
                            where: {
                              deletedAt: {
                                [Op.is]: null,
                              },
                            },
                            required: false
                        },
                    ]
                });

                return apiResponse.success(
                    res, 
                    newPropertyInfo, 
                    httpStatusCode.CREATED, 
                    "Property information updated successfully" 
                );
            }catch(error){
                t.rollback();
                console.log(error);
                return apiResponse.error(
                    res,
                    httpStatusCode.INTERNAL_SERVER,
                    error
                );
            }


        }catch(error){
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
    },

    search: async(req, res, next) => {
        try{

            const {search} = req.query;

            const properties = await db.Property.findAll({
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.substring]: search
                            }
                        }  
                    ],
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            })

            if(!properties || properties.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Property not found.")
            }

            return apiResponse.success(res, properties, httpStatusCode.OK, "Property found successfully");

        }
        catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER);
        }
    }
}

module.exports = publicProperty;