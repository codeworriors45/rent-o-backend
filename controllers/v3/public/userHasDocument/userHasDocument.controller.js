const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../../models');
const { getOneByKeys, getAllByKeys } = require("../../../../utils/helpers/queryHelper");

const userHasDocument = {

    index: async (req, res, next ) => {
        try{

            const { userId } = req.params;

            const userDocs = await getAllByKeys(db.UserHasDocument, {userId: userId});

            if(userDocs == null || userDocs.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user document found.");
            }
    
            return apiResponse.success(res, userDocs, httpStatusCode.OK, "Documents found successfully"); 

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    store: async (req, res, next) => {
        res.send('needed post');
    },

    show: async (req, res, next) => {
        try{

            const { userId, userDocId } = req.params;

            const userDocs = await getAllByKeys(db.UserHasDocument, {id: userDocId, userId: userId});

            if(userDocs == null || userDocs.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user document found.");
            }
    
            return apiResponse.success(res, userDocs, httpStatusCode.OK, "Document found successfully"); 

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    update: async (req, res, next) => {
        res.send('needed update');
    },

    destroy: async ( req, res, next ) => {
        try {
            const { userDocId } = req.params;
    
            if (userDocId == null || userDocId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "userDocId can't be empty!"
                );
            }
    
            const doc = await getOneByKeys(db.UserHasDocument, {
                id: userDocId,
            });
            if (!doc) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Document not found with specific id."
                );
            }
    
            doc.deletedAt = new Date();
            await doc.save();
    
            return apiResponse.success(res, doc);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    }
}

module.exports = userHasDocument;