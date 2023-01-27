const { Op } = require("sequelize");
const db = require('../../../../models'); 
const imageValidation = require('../../../../utils/validation/imageValidation');
const cloudinaryHelper = require('../../../../utils/helpers/cloudinaryHelper');
const { getOneByKeys } = require("../../../../utils/helpers/dbCommon");
const { getAllByKeys } = require("../../../../utils/helpers/queryHelper");
const fs = require('fs');
const  { uploadFile, deleteFile }  = require('../../../../utils/helpers/s3Helper');

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
            let files = req.files;
            const user = req['user'];

            const property = await getOneByKeys(db.Property, {id: propertyId});

            if(!property || property.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No property found.");
            }

            if(user.type == 'BUYER'){
                return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "You are not authorized.");
            }

            if(user.type == 'SELLER' && property.userId != user.id){
                return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "Not your property.");
            }


            let imgArr = [];
    
            await Promise.all(
                files?.images?.map(async (file) => {
                    const f = await fs.readFileSync(file.path);
                    const res = await uploadFile(f, file.filename, 'images');

                    if(res.success) {
                        imgArr.push({
                            propertyId: propertyId,
                            src: res.data
                        });
                    }
                    fs.unlinkSync(file.path);
                })
            );

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
            const user = req['user'];

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

            const property = await getOneByKeys(db.Property, {id: propertyId});

            if(!property || property.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No property found.");
            }

            if(user.type == 'BUYER'){
                return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "You are not authorized.");
            }

            if(user.type == 'SELLER' && property.userId != user.id){
                return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "Not your property.");
            }

            const image = await getOneByKeys(db.PropertyImage, {id: imageId, propertyId: propertyId});

            if (!image || image.length==0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Image not found with specific id."
                );
            }

            let src = [];
            if(image.deletedAt == null){
                src.push(image.src);
            }
            if(src || src.length != 0){
               await deleteFile(src);
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
