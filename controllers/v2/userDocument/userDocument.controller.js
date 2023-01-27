const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models');
const { getOneByKeys, getAllByKeys } = require("../../../utils/helpers/queryHelper");

const userDocument = {
    index: async (req, res, next ) => {
        try{

            const docs = await getAllByKeys(db.UserDocument);

            if(docs == null || docs.length == 0) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No documents type found.");
            }
    
            return apiResponse.success(res, docs, httpStatusCode.OK, "Documents type found successfully"); 

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    store: async (req, res, next ) => {
        try{
            let rules = {
                docType: "required|string",
                sequence: "integer",
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

            const { docType, sequence, visible } = req.body;

            const doc = await db.UserDocument.create({
                docType,
                sequence,
                visible
            })

            if (!doc || doc?.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.UNPROCESSABLE,
                    `User Document is not created.`
                );
            }
    
            return apiResponse.success(res, doc, httpStatusCode.CREATED);
            
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
        }
    },

    update: async (req, res, next) => {
        try {

            let rules = {
                docType: "required|string",
                sequence: "integer",
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
    
            const { docId } = req.params;
            const { docType, sequence, visible } = req.body;
    
            if (docId == null || docId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "docId can't be empty!"
                );
            }
    
            const updatedDoc = await getOneByKeys(db.UserDocument, {
                id: docId,
            });
    
            if (!updatedDoc) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Documents Type not found with specific id."
                );
            }
    
            updatedDoc.docType = docType;
            updatedDoc.sequence = sequence;
            updatedDoc.visible = visible
            await updatedDoc.save();
    
            return apiResponse.success(res, updatedDoc);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    destroy: async (req, res, next ) => {
        try {
            const { docId } = req.params;
    
            if (docId == null || docId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "docId can't be empty!"
                );
            }
    
            const doc = await getOneByKeys(db.UserDocument, {
                id: docId,
            });
            if (!doc) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Document type not found with specific id."
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
};

module.exports = userDocument;