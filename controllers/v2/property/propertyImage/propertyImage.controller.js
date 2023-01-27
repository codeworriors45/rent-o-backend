const { Op } = require("sequelize");
const db = require('../../../../models'); 
const imageValidation = require('../../../../utils/validation/imageValidation');
const cloudinaryHelper = require('../../../../utils/helpers/cloudinaryHelper');
const { getOneByKeys } = require("../../../../utils/helpers/dbCommon");
const { getAllByKeys } = require("../../../../utils/helpers/queryHelper");

const propertyImage = {

    index: async (req, res, next) => {
        try{

            const { propertyId } = req.params;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            const images = await getAllByKeys(db.PropertyImage, {propertyId: propertyId});

            if (!images || images.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No image found."
                );
            }

            return apiResponse.success(res, images);

        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    store: async (req, res, next) => {
        try{

            const { propertyId } = req.params;
            const { images } = req.body; 

            await Promise.all(images?.map(item => {
                let imgValid = imageValidation.base64(item);
                if(!imgValid) {
                    return apiResponse.error(
                        res,
                        httpStatusCode.UNPROCESSABLE, 
                        "Invalid image"
                    );   
                }
            }))

            let imgArr = [];
    
            await Promise.all(await (images?.map(async (item) => {
                let imageUpload = await cloudinaryHelper.upload(item, 'properties');
                if(imageUpload.success){
                    imgArr.push({
                        propertyId: propertyId,
                        src: imageUpload.cloudimg
                    });
                }
            })));

            const newImage = await db.PropertyImage.bulkCreate(imgArr);

            if (!newImage || newImage?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `No new image uploaded.`
                );
            }

            return apiResponse.success(
                res,
                newImage,
                httpStatusCode.CREATED
            );

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    destroy: async ( req, res, next ) => {
        try{

            const { propertyId, imageId } = req.params;

            if (propertyId == null || propertyId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "PropertyId can't be empty!"
                );
            }

            if (imageId == null || imageId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "ImageId can't be empty!"
                );
            }

            const image = await getOneByKeys(db.PropertyImage, {id: imageId, propertyId: propertyId});

            if (!image || image.length==0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Image not found with specific id."
                );
            }

            let public_id;
            let deletedImage;
            if(image.deletedAt == null){
                public_id = image.src?.public_id;
            }
            if(public_id != undefined || public_id != null){
                let deleteOldImg = await cloudinaryHelper.delete(public_id);
                if(deleteOldImg) {
                    deletedImage = true;
                }
            }

            image.deletedAt = new Date();
            await image.save();

            return apiResponse.success(res, image, httpStatusCode.OK, 'image deleted');

        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    }
}

module.exports = propertyImage;
