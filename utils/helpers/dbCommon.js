const db = require("../../models"); 
const { Op } = require("sequelize");



const getUserById = async(id) => {
    const data = await db.User.findOne({
        where: {
            id,
            deletedAt: {
                [Op.is] : null
            }
        }
    });
    
    return data;
}


const getRoleById = async(id) => {
    const data = await db.Role.findOne({
        where: {
            id,
            deletedAt: {
                [Op.is] : null
            }
        }
    });
    
    return data;
}

const getUserAddressById = async(id) => {
    const data = await db.UserAddress.findOne({
        where: {
            id,
            deletedAt: {
                [Op.is] : null
            }
        }
    });
    
    return data;
}


const getUserRoleById = async(id) => {
    const data = await db.UserRole.findOne({
        where: {
            id,
            deletedAt: {
                [Op.is] : null
            }
        }
    });
    
    return data;
}

const getOneByKeys = async (Model, keys, assoc) =>{

    let includes = []

    assoc?.map(modelName =>{
        includes.push({
            model: modelName,
            where: {
                deletedAt: {
                    [Op.is]: null,
                },
            },
        })
    })

    const data = await Model.findOne({
        where:{
            ...keys,
            deletedAt: {
                [Op.is]: null
            }
        },
        include: includes
    })

    return data;
}

const getAllByKeys = async (Model, keys) =>{
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

module.exports = {
    getUserById,
    getUserAddressById,
    getRoleById,
    getUserRoleById,
    getOneByKeys,
    getAllByKeys
};