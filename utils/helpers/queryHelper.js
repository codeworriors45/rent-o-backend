const db = require("../../models")
const { Op } = require("sequelize")

module.exports = queryHelper = {
    getAll: async(Model) => {
        let result = await Model.findAll({
            where: {
                deletedAt: {
                    [Op.is] : null
                }
            },
            order: [
                ['id','asc']
            ]
        });

        return result;
    },


    checkById : async(Model, id) => {
        let result = await Model.findOne({
            where: {
                id,
                deletedAt: {
                    [Op.is] : null
                }
            }
        });

        return result;
    },

    getOneByKeys : async (Model, keys) =>{
        const data = await Model.findOne({
            where:{
                ...keys,
                deletedAt: {
                    [Op.is]: null
                }
            }
        })
    
        return data;
    },
    
    getAllByKeys : async (Model, keys) =>{
        const data = await Model.findAll({
            where:{
                ...keys,
                deletedAt: {
                    [Op.is]: null
                }
            }
        })
    
        return data;
    }


}
