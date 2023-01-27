const { response, request } = require('express');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models');
const { getOneByKeys, getAllByKeys } = require('../../../utils/helpers/dbCommon');
const  { uploadFile, deleteFile }  = require('../../../utils/helpers/s3Helper');
const fs = require('fs');
const queryHelper = require('../../../utils/helpers/queryHelper');

const prequalification = {
    index: async (req, res, next) => {
        try {

            const {id} = req.user;

            const prequalification = await getOneByKeys(db.Prequalification, {userId: id});

            if (prequalification == null || prequalification.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No prequalification found."
                );
            }

            const docs = await getAllByKeys(db.QualificationDocument, {userId: id});

            const data = {
                prequalification: prequalification,
                documents: docs
            }

            return apiResponse.success(res, data);
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },


    update: async (req, res, next) => {
        let rules = {
            applicantIncome: "numeric",
            coApplicantIncome: "numeric",
            downpayment: "numeric"
        };

        try{

            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    httpStatusCode.UNPROCESSABLE,
                    "Validation Error"
                );
            }

            const { qualificationId } = req.params;
            const { id: userId } = req.user;

            const {  applicantIncome, coApplicantIncome, downpayment } = req.body;

            if (qualificationId == null || qualificationId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "QualificationId can't be empty!"
                );
            }


            let prequalification = await getOneByKeys(db.Prequalification, { id: qualificationId });

            if (!prequalification) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Prequalification not found with specific id."
                );
            }

            if(prequalification.userId != userId) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Prequalification does not belong to this user"
                );
            }

            prequalification.applicantIncome = applicantIncome;
            prequalification.coApplicantIncome = coApplicantIncome;
            prequalification.downpayment = downpayment;
            prequalification.status = "PROCESSING";

            await prequalification.save();

            let loeFile = [], dpdFile = [], craFile = [], cra1File = [], rpsFile = []; 
            let deletekeys = [];

            let existingDoc = await queryHelper.getAllByKeys(db.QualificationDocument, { userId : userId });
            // console.log(existingDoc)

            if("LOE" in req.files){
                await Promise.all(
                    req.files.LOE.map(async (file) => {
                        var f = await fs.readFileSync(file.path);
                        let res = await uploadFile(f, file.filename, 'LOE');

                        if(res.success) {
                            loeFile.push({
                                userId: userId,
                                type: 'LOE',
                                src: res.data
                            });
                        }
                        await fs.unlinkSync(file.path);
                    }),

                    existingDoc?.map(async(doc) => {
                        if(doc.type === 'LOE') {
                            doc.deletedAt = new Date();
                            await doc.save();
                            deletekeys.push(doc.src);
                        }
                    }),

                );
                
                if(loeFile.length > 0) {
                    console.log('loe file')
                    await db.QualificationDocument.bulkCreate(loeFile);
                }
            }

            if("downpaymentDoc" in req.files){
                await Promise.all(
                    req.files.downpaymentDoc.map(async (file) => {
                        var f = await fs.readFileSync(file.path);
                        let res = await uploadFile(f, file.filename, 'downpaymentDoc');

                        if(res.success) {
                            dpdFile.push({
                                userId: userId,
                                type: 'downpaymentDoc',
                                src: res.data
                            });
                        }
                        await fs.unlinkSync(file.path);
                    }),

                    existingDoc?.map(async(doc) => {
                        if(doc.type === 'downpaymentDoc') {
                            doc.deletedAt = new Date();
                            await doc.save();
                            deletekeys.push(doc.src);
                        }
                    }),

                    
                );

                if(dpdFile.length > 0) {
                    await db.QualificationDocument.bulkCreate(dpdFile);
                }
            }

            if("CRA" in req.files){
                await Promise.all(
                    req.files.CRA.map(async (file) => {
                        var f = await fs.readFileSync(file.path);
                        let res = await uploadFile(f, file.filename, 'CRA');

                        if(res.success) {
                            craFile.push({
                                userId: userId,
                                type: 'CRA',
                                src: res.data
                            });
                        }
                        await fs.unlinkSync(file.path);
                    }),

                    existingDoc?.map(async(doc) => {
                        if(doc.type === 'CRA') {
                            doc.deletedAt = new Date();
                            await doc.save();
                            deletekeys.push(doc.src);
                        }
                    }),

                );

                if(craFile.length > 0) {
                    await db.QualificationDocument.bulkCreate(craFile);
                }
            }
            if("CRA1" in req.files){
                await Promise.all(
                    req.files.CRA1.map(async (file) => {
                        var f = await fs.readFileSync(file.path);
                        let res = await uploadFile(f, file.filename, 'CRA1');

                        if(res.success) {
                            cra1File.push({
                                userId: userId,
                                type: 'CRA1',
                                src: res.data
                            });
                        }
                        await fs.unlinkSync(file.path);
                    }),

                    existingDoc?.map(async(doc) => {
                        if(doc.type === 'CRA1') {
                            doc.deletedAt = new Date();
                            await doc.save();
                            deletekeys.push(doc.src);
                        }
                    }),

                );

                if(cra1File.length > 0) {
                    await db.QualificationDocument.bulkCreate(cra1File);
                }
            }
            if("RPS" in req.files){
                await Promise.all(
                    req.files.RPS.map(async (file) => {
                        var f = await fs.readFileSync(file.path);
                        let res = await uploadFile(f, file.filename, 'RPS');

                        if(res.success) {
                            rpsFile.push({
                                userId: userId,
                                type: 'RPS',
                                src: res.data
                            });
                        }
                        await fs.unlinkSync(file.path);
                    }),

                    existingDoc?.map(async(doc) => {
                        if(doc.type === 'RPS') {
                            doc.deletedAt = new Date();
                            await doc.save();
                            deletekeys.push(doc.src);
                        }
                    }),

                );

                if(rpsFile.length > 0) {
                    await db.QualificationDocument.bulkCreate(rpsFile);
                }
            }

            await deleteFile(deletekeys); //deletes previous files from s3 bucket.

            const docs = await getAllByKeys(db.QualificationDocument, {userId: userId});

            const data = {
                prequalification: prequalification,
                documents: docs
            }

            return apiResponse.success(res, data);

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }

    },

    show: async (req, res, next) => {
        try{

            const { qualificationId } = req.params;

            if (qualificationId == null || qualificationId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "QualificationId can't be empty!"
                );
            }

            const data = await getOneByKeys(db.Prequalification, {id: qualificationId});

            if (data == null || data.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No pre-qualification data found with specific id."
                );
            }

            return apiResponse.success(res, data);

        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    showByUser: async (req, res, next) => {
        try{

            const { 
                status,
                page, 
                limit,
                orderby,
                order } = req.query;
            const { userId } = req.params;

            let tempOrderBy = orderby ? orderby : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit ? limit : 50;

            if (userId == null || userId === undefined) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "UserId can't be empty!"
                );
            }

            let tempStatus= [];
                
            if(status || status!=undefined){
                tempStatus.push(status);
            }
            else{
                tempStatus = ["PENDING", "PROCESSING", "APPROVED", "REJECTED"]
            }

            const dataTotal = await db.Prequalification.findAll({
                where: {
                    [Op.and]: [
                        {
                            userId: userId
                        },
                        {
                            status: {
                                [Op.or]: tempStatus
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]:null
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
                        include: [
                            {
                                model: db.QualificationDocument,
                                where: {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                },
                                required: false
                            }
                        ]
                    }
                ]
            });

            const data = await db.Prequalification.findAll({
                where: {
                    [Op.and]: [
                        {
                            userId: userId
                        },
                        {
                            status: {
                                [Op.or]: tempStatus
                            }
                        },
                        {
                            deletedAt: {
                                [Op.is]:null
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
                        include: [
                            {
                                model: db.QualificationDocument,
                                where: {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                },
                                required: false
                            }
                        ]
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ],
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            });

            if (data == null || data.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No pre-qualification data found with specific user id."
                );
            }

            const tempData = {
                prequalification: data,
                total: dataTotal.length
            }

            return apiResponse.success(res, tempData, httpStatusCode.OK, 'User prequalificatios retrived successfully');

        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    getAll: async (req, res, next) => {
        try {
            const { 
                status,
                page, 
                limit,
                orderby,
                order } = req.query;

            let tempOrderBy = orderby ? orderby : 'createdAt';
            let tempOrder = order ? order : 'DESC';
            let tempPage = page > 0 ? page : 1;
            let tempLimit = limit ? limit : 50;

            let tempStatus= [];
                
            if(status || status!=undefined){
                tempStatus.push(status);
            }
            else{
                tempStatus = ["PENDING", "PROCESSING", "APPROVED", "REJECTED"]
            }

            let prequalifications = await db.Prequalification.findAll({
                where: {
                    applicantIncome: {
                        [Op.ne] : 0
                    },
                    status: {
                            [Op.or]: tempStatus
                        },
                    deletedAt: {
                        [Op.is] : null
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
                        },
                        include: [
                            {
                                model: db.QualificationDocument,
                                where: {
                                    deletedAt: {
                                        [Op.is]: null
                                    }
                                },
                                required: false
                            }
                        ]
                    }
                ],
                order: [
                    [tempOrderBy, tempOrder],
                ],
                offset: (tempPage-1)*tempLimit, 
                limit: tempLimit
            });

            let prequalificationsCount = await db.Prequalification.findAll({
                where: {
                    applicantIncome: {
                        [Op.ne] : 0
                    },
                    status: {
                        [Op.or]: tempStatus
                    },
                    deletedAt: {
                        [Op.is] : null
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
                    }
                ]
            });

            if (prequalifications == null || prequalifications.length == 0) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "No prequalification found."
                );
            }

            let data = {
                prequalifications,
                count: prequalificationsCount.length
            }


            return apiResponse.success(res,  data, httpStatusCode.OK, "Prequalification found successfully.");
        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },

    updateById: async (req, res) => {
        try {
            let rules = {
                status: "required|in:PENDING,PROCESSING,REJECTED,APPROVED",
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
            const { status } = req.body; 

            if(!id) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Id can not be empty!");
            }

            let prequalification = await queryHelper.checkById(db.Prequalification, id);

            if (!prequalification) {
                return apiResponse.error(
                    res,
                    httpStatusCode.NOT_FOUND,
                    "Prequalification not found with specific identifier."
                );
            }

            prequalification.status = status;
            await prequalification.save();

            return apiResponse.success(res, prequalification, httpStatusCode.OK, "Prequalification updated successfully.");

        } catch (error) {
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
    },
}

module.exports = prequalification;