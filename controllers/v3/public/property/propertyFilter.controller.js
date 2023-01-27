const {Op} = require('sequelize');
const Validator = require('validatorjs');
const db = require('../../../../models');

const getIntArray = (str) => {
    return str.split(',').map(function(item) {
        return parseInt(item);
    });
}

const propertyFilterController = {
    filter: async (req, res, next) => {
        try{
            const {
                minPrice, 
                maxPrice, 
                cityIds, 
                proviceIds, 
                listingTypeIds, 
                minSize, 
                maxSize, 
                orderBy, 
                order,
                page,
                limit
            } = req.query;
    
            let cities = [];
            let listing = [];
            let tempOrderBy = orderBy ? orderBy : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit ? limit : 50;
    
            let tempMinPrice = minPrice ? minPrice : 0;
            let tempMaxPrice = maxPrice ? maxPrice : 100000000000;
            let tempMinSize = minSize ? parseFloat(minSize) : 0;
            let tempMaxSize = maxSize ? parseFloat(maxSize) : 20000000; 
    
            if(listingTypeIds == null || listingTypeIds.length == 0){
                let tempListing = await db.ListingType.findAll({
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    }
                });
                if (tempListing == null || tempListing.length == 0) {
                    return apiResponse.error(
                        res,
                        httpStatusCode.NOT_FOUND,
                        "No property found with specific listing."
                    );
                }
                Promise.all(tempListing.map(item => {
                    listing.push(item.id);
                }))
    
            }
            else{
                listing = getIntArray(listingTypeIds);
            }
    
            if(cityIds == null || cityIds.length == 0){
                if(proviceIds ==null || proviceIds.length == 0){
                    let tempCities = await db.City.findAll({
                        where:{
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    })
                    if (tempCities == null || tempCities.length == 0) {
                        return apiResponse.error(
                            res,
                            httpStatusCode.NOT_FOUND,
                            "No property found in the specific province."
                        );
                    }
                    Promise.all(tempCities.map(item => {
                        cities.push(item.id);
                    }))
                }
                else{
                    let tempCities = await db.City.findAll({
                        where:{
                            provinceId: {
                                [Op.or]: getIntArray(proviceIds)
                            }
                        }
                    })
                    // console.log(tempCities);
                    if (tempCities == null || tempCities.length == 0) {
                        return apiResponse.error(
                            res,
                            httpStatusCode.NOT_FOUND,
                            "No property found in the specific province."
                        );
                    }
                    Promise.all(tempCities.map(item => {
                        cities.push(item.id);
                    }))
                }
            }
            else{
                cities = getIntArray(cityIds);
            }
    
            const total = await db.Property.findAll({
                where: {
                    //got the ids from province and cities
                    [Op.and]: [
                        {
                            approve: {
                                [Op.is]: true
                            }
                        },
                        {
                            listingTypeId: {
                                [Op.or]: listing
                            }
                        },
                        {   
                            price:{
                                [Op.and]:{
                                    [Op.gte]: tempMinPrice,
                                    [Op.lte]: tempMaxPrice
                                }
                            }
                        },
                        {
                            squareFootage: {
                                [Op.and]:{
                                    [Op.gte]: tempMinSize,
                                    [Op.lte]: tempMaxSize
                                }
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                },
                include: [
                    {
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                    },
                    {
                        model: db.PropertyAddress,
                        where: {
                            cityId: {
                                [Op.or]: cities
                            }
                        }
                    },
                ],
            })
    
            const property = await db.Property.findAll({
                where: {
                    //got the ids from province and cities
                    [Op.and]: [
                        {
                            approve: {
                                [Op.is]: true
                            }
                        },
                        {
                            listingTypeId: {
                                [Op.or]: listing
                            }
                        },
                        {   
                            price:{
                                [Op.and]:{
                                    [Op.gte]: tempMinPrice,
                                    [Op.lte]: tempMaxPrice
                                }
                            }
                        },
                        {
                            squareFootage: {
                                [Op.and]:{
                                    [Op.gte]: tempMinSize,
                                    [Op.lte]: tempMaxSize
                                }
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    ]
                }, 
                order: [
                    [tempOrderBy, tempOrder],
                ],
                include: [
                    {
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                    },
                    {
                        model: db.PropertyAddress,
                        where: {
                            cityId: {
                                [Op.or]: cities
                            }
                        },
                        include: [
                            {
                                model: db.City,
                            }
                        ]
                    },
                    {
                        model: db.PropertyFeature,
                        where:{
                            deletedAt:{
                                [Op.is]: null
                            },
                        },
                        required: false,
                        include: [db.Feature],
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
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            })
    
            let nextURL = '';
            let prevURL = '';
            
            if(tempPage == 1 && parseInt(total.length) <= parseInt(tempLimit)){
                prevURL = '';
                nextURL = '';
            }
            else if(tempPage==1 && parseInt(total.length) > parseInt(tempLimit)){
                prevURL = '';
                nextURL = `${req.protocol}://${req.headers.host}/v2/public/property/filter?${minPrice ? `minPrice=${minPrice}&`: '' }${maxPrice ? `maxPrice=${maxPrice}&`:''}${proviceIds ? `proviceIds=${proviceIds}&`:''}${listingTypeIds ? `listingTypeIds=${listingTypeIds}&`:''}${minSize ? `minSize=${minSize}&`:''}${maxSize ? `maxSize=${maxSize}&`:''}${orderBy ? `orderBy=${orderBy}&`:''}${order ? `order=${order}&`:''}${tempPage ? `page=${parseInt(tempPage)+1}&`:''}${limit ? `limit=${limit}`:''}`;
            }
            else if(tempPage==(Math.ceil(total/tempLimit))){
                prevURL = `${req.protocol}://${req.headers.host}/v2/public/property/filter?${minPrice ? `minPrice=${minPrice}&`: '' }${maxPrice ? `maxPrice=${maxPrice}&`:''}${proviceIds ? `proviceIds=${proviceIds}&`:''}${listingTypeIds ? `listingTypeIds=${listingTypeIds}&`:''}${minSize ? `minSize=${minSize}&`:''}${maxSize ? `maxSize=${maxSize}&`:''}${orderBy ? `orderBy=${orderBy}&`:''}${order ? `order=${order}&`:''}${tempPage ? `page=${parseInt(tempPage)-1}&`:''}${limit ? `limit=${limit}`:''}`;
                nextURL = '';
            }
            else if(tempPage>1){
                prevURL = `${req.protocol}://${req.headers.host}/v2/public/property/filter?${minPrice ? `minPrice=${minPrice}&`: '' }${maxPrice ? `maxPrice=${maxPrice}&`:''}${proviceIds ? `proviceIds=${proviceIds}&`:''}${listingTypeIds ? `listingTypeIds=${listingTypeIds}&`:''}${minSize ? `minSize=${minSize}&`:''}${maxSize ? `maxSize=${maxSize}&`:''}${orderBy ? `orderBy=${orderBy}&`:''}${order ? `order=${order}&`:''}${tempPage ? `page=${parseInt(tempPage)-1}&`:''}${limit ? `limit=${limit}`:''}`;
    
                nextURL = `${req.protocol}://${req.headers.host}/v2/public/property/filter?${minPrice ? `minPrice=${minPrice}&`: '' }${maxPrice ? `maxPrice=${maxPrice}&`:''}${proviceIds ? `proviceIds=${proviceIds}&`:''}${listingTypeIds ? `listingTypeIds=${listingTypeIds}&`:''}${minSize ? `minSize=${minSize}&`:''}${maxSize ? `maxSize=${maxSize}&`:''}${orderBy ? `orderBy=${orderBy}&`:''}${order ? `order=${order}&`:''}${tempPage ? `page=${parseInt(tempPage)+1}&`:''}${limit ? `limit=${limit}`:''}`;
            }
    
            const data = {
                nextUrl: nextURL,
                prevUrl: prevURL,
                count: total.length
            }
    
            if (property == null || property.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No property found."
                );
            }
    
            return apiResponse.successWithExtra(
                res, 
                property, 
                httpStatusCode.OK, 
                'Property found.', 
                data
            );
        }catch(error){
            console.log(error);
            return apiResponse.error(
                res,
                httpStatusCode.INTERNAL_SERVER,
                error
            );
        }
        
    },

    map: async(req,res) => {
        try {
            const { lat: latitude, lng: longitude } = req.query;
            const radius = 50;

            if(!latitude || !longitude) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Latitude and Longitude can not be empty!")
            }

            let sql = `SELECT *,
                    ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( CAST("latitude" as float) ) ) * cos( radians( CAST("longitude" as float) ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( CAST("latitude" as float) ) ) ) ) AS distance 
                    FROM property_addresses 
                    order by distance desc ` ;

            const points = await db.sequelize.query(`${sql}`, { type: db.sequelize.QueryTypes.SELECT });
            

            let distance = []
            points.map((point) => {
                if(point.distance < radius) {
                    distance.push(point.propertyId);
                } 
            })

            if(!distance || distance?.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No property found within this range")
            }

            const properties = await db.Property.findAll({
                where: {
                    id: {
                        [Op.in]: distance
                    },
                    approve: {
                        [Op.is]: true
                    },
                    deletedAt: {
                        [Op.is]: null
                    }
                },
                include: [
                    { 
                        model: db.User,
                        attributes: ['id','email', 'firstName', 'lastName', 'dob', 'image', 'phoneNumber', 'gender'],
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        }
                    },
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
                        }
                    },
                    {
                        model: db.PropertyFeature,
                        where: {
                            deletedAt: {
                                [Op.is]: null
                            }
                        },
                        required: false,
                        include: [{model: db.Feature, where: {deletedAt: {[Op.is]:null}}}]
                    }
                ],
            })

            return apiResponse.success(res, properties, httpStatusCode.OK, "Property found");
        } catch (error) {
            console.log(error)
            return apiResponse.errorWithData(res, error, httpStatusCode.NOT_FOUND, "No property found within this range")
        }
        
    },

    test: async (req, res, next) => {

        // 24.4347231,90.7823838,16.71z
        // const latitude  = 24.4347231;
        // const longitude = 90.7823838;
        const { lat: latitude, lng: longitude } = req.query;

        const radius = 50;

        let sql = `SELECT *,
                ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( CAST("latitude" as float) ) ) 
                * cos( radians( CAST("longitude" as float) ) - radians(${longitude}) ) + sin( radians(${latitude}) ) 
                * sin( radians( CAST("latitude" as float) ) ) ) ) AS distance 
                FROM property_addresses 
                order by distance desc ` ;

        const points = await db.sequelize.query(`${sql}`, { type: db.sequelize.QueryTypes.SELECT });
        let distance = []
        points.map((point) => {
            if(point.distance <= 200) {
                distance.push(point);
            } 
        })
        return res.json(distance);

        const properties = await db.Property.findAll({
            where: {
                id: {
                    [Op.in]: distance
                },
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
                    }
                }
            ],
        })

        return res.json(properties);
    }
}

module.exports = propertyFilterController;