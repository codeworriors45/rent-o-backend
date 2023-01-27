
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../../models');
const generateHash = require("../../../utils/helpers/generateHash");
const { getOneByKeys, getAllByKeys } = require("../../../utils/helpers/queryHelper");
const forgetPasswordMail = require('../../../utils/mails/service/forget-password');
const passwordHelper = require('../../../utils/helpers/passwordHelper');

const link = process.env.FRONTEND_LINK || "https://rent-to-own-frontend.vercel.app"

const forgetPassword = {

    index: async (req, res, next)=> {
        try{
            const { email } = req.body;

            const user = await getOneByKeys(db.User, {email: email});
    
            if(!user || user.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found.");
            }
    
            const hash = await generateHash.hash(`${email}123`);
    
            const forgetPassword = await db.ForgetPassword.create({
                userId: user.id,
                hash: hash,
                expiresAt: Date.now() + (4*24*60*60*1000)
            })
    
            if(!forgetPassword || forgetPassword.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND , "Can not create forget-password instance.");
            }

            let tempLink = `${link}/forget-password?hash=${hash}`;
    
            forgetPasswordMail(email, tempLink);

            const { hash: tempHash, ...rest } = forgetPassword.dataValues;
    
            return apiResponse.success(
                res, 
                rest, 
                httpStatusCode.CREATED, 
                "A link has been sent to your email. Plase check your mail inbox or spam inbox" 
            );
        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        }
        
    }, 

    store: async (req, res, next) => {

        try{
            let rules = {
                hash: "required",
                password: "required|string|min:1|max:100"
            }; 
            const validation = new Validator(req.body, rules);
            if (validation.fails()) {
                return apiResponse.errorWithData(
                    res,
                    validation.errors.all(),
                    422,
                    "Validation Error"
                );
            }
    
            const { email, password, hash } = req.body
    
            const forgetPassword = await db.ForgetPassword.findOne({
                where: {
                    hash: hash,
                    expiresAt: {
                        [Op.gt]: Date.now() 
                    },
                    deletedAt:{
                        [Op.is]: null
                    }
                }
            });
    
            if(!forgetPassword || forgetPassword.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Invalid link.");
            }

            const user = await getOneByKeys(db.User, {id: forgetPassword.userId});

            if(!user || user.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user found.");
            }
    
            let hashedPass = await passwordHelper.hash(password);

            user.password = hashedPass;
            await user.save();

            const updated = await db.ForgetPassword.update({deletedAt: Date.now()},{
                where: {
                    userId: user.id
                }
            })

            const { password: tempPass, ...rest } = user.dataValues;
    
            return apiResponse.success(res, rest, httpStatusCode.OK, "New Password updated! Please login");
        }catch(error){
            console.log(error);
            return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
        } 
    }
}

module.exports = forgetPassword;