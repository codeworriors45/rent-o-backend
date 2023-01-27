const { response, request } = require('express');
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require('../../models'); 
const { getRoleById } = require("../../utils/helpers/dbCommon");

const getRole = async (req, res = response) => {
    
    try {
        const { id } = req.params;
        const role = await db.Role.findByPk(id);

        if( !role ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Role not found with specific id.");
        }

        return apiResponse.success(res, role, httpStatusCode.OK, "Role found successfully."); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const getRoles = async (req, res = response) => {
    
    try {
        const roles = await db.Role.findAll({                    
            where: {
                deletedAt : {
                    [Op.is]: null, 
                }
            }        
        });

        if(roles == null || roles.length == 0) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No roles found.");
        }

        return apiResponse.success(res, roles); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}


const putRole = async(req, res = response) => {

    let rules = {        
        name: "required|string|min:1|max:50"
    };

    try {

        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
          return apiResponse.errorWithData(
            res,
            validation.errors.all(),
            422,
            "Validation Error"
          );
        }

        const { id } = req.params;         
        const { createdAt, updatedAt, deletedAt, ...role } = req.body;
        
        const roleDb = await getRoleById(id);
        if( ! roleDb ) {
             return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Role not found with specific id.");
        } 

        const roleDbWithSameName = await db.Role.findOne({ where: { name: role.name, id : { [Op.not] : id},deletedAt: { [Op.is] : null}}});
        if( roleDbWithSameName ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `${roleDbWithSameName.name} already exists`);
        }

        role.updatedAt = new Date();

        roleDb.update(role);         
        roleDb.save();

        return apiResponse.success(res, roleDb); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const postRole = async(req, res = response) => {
    
        
    let rules = {        
        name: "required|string|min:1|max:50"
    };

    try {       

        const validation = new Validator(req.body, rules);
        if (validation.fails()) {
          return apiResponse.errorWithData(
            res,
            validation.errors.all(),
            422,
            "Validation Error"
          );
        }

        const { createdAt, updatedAt, deletedAt, ...role } = req.body;
        
        const roleDb = await db.Role.findOne({ where: { name: role.name, deletedAt: { [Op.is] : null}}});
        if( roleDb ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `Role ${roleDb.name} already exists`);
        }

        const roleDbWithSameName = await db.Role.findOne({ where: { name: role.name, id : { [Op.not] : id},deletedAt: { [Op.is] : null}}});
        if( roleDbWithSameName ) {
            return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `${roleDbWithSameName.name} already exists`);
        }

        role.createdAt = new Date();

        const newRole = await db.Role.create(role);

        return apiResponse.success(res, newRole, httpStatusCode.CREATED); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

const deleteRole = async(req, res = response) => {

    try {
        const { id } = req.params;

        const roleDb = await getRoleById(id);
        if( !roleDb ) {
            return apiResponse.error(res, httpStatusCode.NOT_FOUND, "Role not found with specific id.");
        }

        roleDb.deletedAt = new Date();
        roleDb.save();

        return apiResponse.success(res,roleDb); 
    } 
    catch (error) {
        console.log(error);
        return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
    }
}

module.exports = {
   getRole,
   getRoles,
   putRole,
   postRole,
   deleteRole
}