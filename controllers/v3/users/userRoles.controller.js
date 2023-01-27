const { response } = require("express");
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../../models");
const { getUserRoleById } = require("../../../utils/helpers/dbCommon");

const getUserRole = async (req, res = response) => {
    
  try {
      const { id } = req.params;
      const userRole = await db.UserRole.findByPk(id);

      if( !userRole ) {
          return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserRole not found with specific id.");
      }

      return apiResponse.success(res, userRole, httpStatusCode.OK, "UserRole found successfully."); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }

}

const getUserRoles = async (req, res = response) => {
  
  try {
      const userAddreses = await db.UserRole.findAll({                    
          where: {
              deletedAt : {
                  [Op.is]: null, 
              }
          }        
      });

      if(userAddreses == null || userAddreses.length == 0) {
          return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user roles found.");
      }

      return apiResponse.success(res, userAddreses); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
}

const updateUserRole = async(req, res = response) => {

  let rules = {
    userId: "required|numeric",
    roleId: "required|numeric"
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
      
      const { createdAt, updatedAt, deletedAt, ...userRole } = req.body;
      
      const userRoleDb = await getUserRoleById(id);
      if( ! userRoleDb ) {
           return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserRole not found with specific id.");
      }     
   
      const existsUserRoleDb  = await db.UserRole.findOne({ where: { userId: userRole.userId, roleId: userRole.roleId, id : { [Op.not] : id},deletedAt: { [Op.is] : null}}});
      if( existsUserRoleDb ) {
          return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `UserRole already exists`);
      }

      userRole.updatedAt = new Date();

      userRoleDb.update(userRole);         
      userRoleDb.save();

      return apiResponse.success(res, userRoleDb); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
}

const createUserRole = async (req, res = response) => {  
  let rules = {
    userId: "required|numeric",
    roleId: "required|numeric"
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
    
    const { createdAt, updatedAt, deletedAt, ...userRole } = req.body;

    const userRoleDb = await db.UserRole.findOne({ where: { userId: userRole.userId, roleId: userRole.roleId, deletedAt: { [Op.is] : null}}});
      
    if( userRoleDb ) {
        return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `UseRole already exists`);
    }

    userRole.createdAt = new Date();    
    const newUserRole = await db.UserRole.create(userRole);

    return apiResponse.success(res, newUserRole, httpStatusCode.CREATED); 
  } 
  catch (error) {
    console.log(error);
    return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
  }
};


const deleteUserRole = async (req, res = response) => {
  try {
    const { id } = req.params;

    const userRoleDb = await getUserRoleById(id);
    if( !userRoleDb ) {
        return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserRole not found with specific id.");
    }

    userRoleDb.deletedAt = new Date();
    userRoleDb.save();

    return apiResponse.success(res, userRoleDb); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
};

module.exports = {
  getUserRole,
  getUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
};
