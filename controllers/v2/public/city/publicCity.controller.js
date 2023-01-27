const {Op} = require('sequelize');
const Validator = require('validatorjs');
const db = require('../../../../models');
const {getOneByKeys, getAllByKeys} = require('../../../../utils/helpers/dbCommon');

const publicCity = {
    getCity: async (req, res, next) =>{
        try{
            const { name } = req.body;

            if(!name) {
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "City name can not be found.")
            }

            const city = await db.City.findAll({
                where: {
                    [Op.or]: [
                        {
                            name: {
                                [Op.iLike]: name.toLowerCase()+'%'
                            }
                        }
                    ],
                    deletedAt: {
                        [Op.is]: null
                    }
                }
            });
    
            if(!city || city.length == 0){
                return apiResponse.error(res, httpStatusCode.NOT_FOUND, "City not found.")
            }
    
            return apiResponse.success(res, city, httpStatusCode.OK, "City found successfully");
        }
        catch(error){
            console.log(error);
            return apiResponse.errorWithData(res, error, httpStatusCode.INTERNAL_SERVER); 
        }
    }
}

module.exports = publicCity;