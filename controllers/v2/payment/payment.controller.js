
const db = require('../../../models');
const Validator = require("validatorjs");
const { Op } = require("sequelize");
const { getOneByKeys } = require('../../../utils/helpers/dbCommon');
const stripe = require('stripe')(process.env.STRIPE_SK)


const index = async (req, res) => {
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
        let tempLimit = limit ? limit : 50;

        const payments = await db.SubcriptionPayment.findAll({
            where: {
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: db.Property,
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

        if(payments == null || payments.length == 0) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No payments data found.");
        }

        const paymentsCount = await db.SubcriptionPayment.findAll({
            where: {
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: db.Property,
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    },
                    required: false
                }
            ]
        });

        const data = {
            payments,
            count: paymentsCount.length
        }

        return apiResponse.success(res, data, httpStatusCode.OK, "Payments data found successfully"); 

    }catch(error){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const getUserPayment = async (req, res) => {
    try{

        const user = req['user'];

        const { 
            page, 
            limit,
            orderby,
            order
        } = req.query;

        let tempOrderBy = orderby ? orderby : 'createdAt';
        let tempOrder = order ? order : 'DESC';
        let tempPage = page > 0 ? page : 1;
        let tempLimit = limit ? limit : 50;

        const payments = await db.SubcriptionPayment.findAll({
            where: {
                userId: user.id,
                deletedAt: {
                    [Op.is]: null
                }
            },
            attributes: ['id', 'userId', 'propertyId','transactionId', 'status', 'amount', 'currency', 'payerGatewayMethod', 'payerName', 'payerEmail'],
            include: [
                {
                    model: db.Property,
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

        if(payments == null || payments.length == 0) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No payments data found.");
        }

        const paymentsCount = await db.SubcriptionPayment.findAll({
            where: {
                userId: user.id,
                deletedAt: {
                    [Op.is]: null
                }
            },
            include: [
                {
                    model: db.Property,
                    where: {
                        deletedAt: {
                            [Op.is]: null
                        }
                    },
                    required: false
                }
            ]
        });

        const data = {
            payments,
            count: paymentsCount.length
        }

        return apiResponse.success(res, data, httpStatusCode.OK, "Payments data found successfully"); 
    }catch(error){
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER); 
    }
}

const payment = async(req, res) => {
    console.log('payment')
    // return 
    try {

        let rules = {
            propertyId: "required|integer"
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

        const {propertyId} = req.body;

        const user = req['user'];

        const tempUser = await getOneByKeys(db.User, {id: user.id});

        if (tempUser == null || tempUser.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "No user found."
            );
        }

        const tempProperty = await getOneByKeys(db.Property, {id: propertyId, userId: user.id});

        if (tempProperty == null || tempProperty.length == 0) {
            return apiResponse.error(
                res,
                httpStatusCode.NOT_FOUND,
                "No property found."
            );
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "cad",
                        product_data: {
                            name: 'rent subscription',
                            // customerId: 1,
                        },
                        unit_amount: 499 * 100,
                    },
                    description: "Subscription fees for the User to list their property.",
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                propertyId: propertyId
            },
            mode: "payment",
            success_url: `${req.protocol}://${req.headers.host}/api/v2/payments/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.headers.host}/api/v2/payments/cancel`,
        });
    
        // console.log("s" , session)

        const data = {
            userId: user.id,
            propertyId: propertyId,
            url: session.url
        }

        return apiResponse.success(res, data)
    
    } catch (error) {
        console.log("error" , error)
        return res.json(error);
    }

}

const success = async(req,res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    const customer = await stripe.customers.retrieve(session.customer);

    const {userId, propertyId} = session.metadata;

    const {email: payerEmail, name: payerName, address} = customer;

    const {amount_total: amount, id: invoicePrefix, payment_intent: transactionId, customer: payerGatewayId, payment_status, currency } = session;

    try{
        let status;
        if(payment_status=='paid'){
            status = "PAID";
        }
        let paymentMethod = 'CARD';
        let payerGatewayMethod = 'STRIPE';

        const payment = await db.SubcriptionPayment.create({
            userId,
            propertyId,
            transactionId,
            currency,
            status,
            payerGatewayMethod,
            payerEmail,
            payerName,
            amount,
            payerGatewayId,
            paymentMethod,
            invoicePrefix,
            payerAddress: address,
            metaData: session
        })

        const property = await getOneByKeys(db.Property, {id: propertyId});

        property.subscriptionStatus = 'PAID';  
        await property.save();

        res.redirect(`${process.env.FRONTEND_LINK}/success/${userId}`);
    
        //return apiResponse.success(res, payment, httpStatusCode.OK, 'Payment has been successful.');
    
    }catch(error){
        console.log("error" , error)
        return res.json(error);
    }

}

const cancel = async (req,res) => {
    res.redirect(`${process.env.FRONTEND_LINK}/cancel`);
    // return apiResponse.error(res, httpStatusCode.UNPROCESSABLE, 'Payment has been cancelled.');
}

module.exports = {
   index, getUserPayment, payment, success, cancel
}

