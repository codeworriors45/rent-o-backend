const { response } = require("express");
const { Op } = require("sequelize");
const Validator = require("validatorjs");
const db = require("../../models");
const { getUserAddressById } = require("../../utils/helpers/dbCommon");

const getUserAddress = async (req, res = response) => {
    
  try {
      const { id } = req.params;
      const userAddress = await db.UserAddress.findByPk(id);

      if( !userAddress ) {
          return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserAddress not found with specific id.");
      }

      return apiResponse.success(res, userAddress, httpStatusCode.OK, "UserAddress found successfully."); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }

}

const getUserAddresses = async (req, res = response) => {
  
  try {
      const userAddreses = await db.UserAddress.findAll({                    
          where: {
              deletedAt : {
                  [Op.is]: null, 
              }
          }        
      });

      if(userAddreses == null || userAddreses.length == 0) {
          return apiResponse.error(res, httpStatusCode.NOT_FOUND, "No user addresses found.");
      }

      return apiResponse.success(res, userAddreses); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
}

const updateUserAddress = async(req, res = response) => {
  
  let rules = {
    userId: "required",
    street: "string|min:1|max:50",
    number: "string|min:1|max:50",
    latitude: "string|min:1|max:20",
    longitude: "string|min:1|max:20",
    apt: "string|min:1|max:10",
    zipCode: "string|min:1|max:10",
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
      
      const { userId, createdAt, updatedAt, deletedAt, ...userAddress } = req.body;
      
      const userAddressDb = await getUserAddressById(id);
      if( ! userAddressDb ) {
           return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserAddress not found with specific id.");
      }     
   
      userAddress.updatedAt = new Date();

      userAddressDb.update(userAddress);         
      userAddressDb.save();

      return apiResponse.success(res, userAddressDb); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
}

const createUserAddress = async (req, res = response) => {  
  let rules = {
    userId: "required",
    street: "required|string|min:1|max:50",
    number: "required|string|min:1|max:50",
    latitude: "required|string|min:1|max:20",
    longitude: "required|string|min:1|max:20",
    apt: "string|min:1|max:10",
    zipCode: "string|min:1|max:10",
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
    
    const { userId, createdAt, updatedAt, deletedAt, ...userAddress } = req.body;

    const userAddressDb = await db.UserAddress.findOne({ where: { userId: userId, deletedAt: { [Op.is] : null}}});
      
    if( userAddressDb ) {
        return apiResponse.error(res, httpStatusCode.BAD_REQUEST, `User already has an address`);
    }

    userAddress.createdAt = new Date();
    userAddress.userId = userId;
    const newUserAddress = await db.UserAddress.create(userAddress);

    return apiResponse.success(res, newUserAddress, httpStatusCode.CREATED); 
  } 
  catch (error) {
    console.log(error);
    return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error);
  }
};


const deleteUserAddress = async (req, res = response) => {
  try {
    const { id } = req.params;

    const userAddressDb = await getUserAddressById(id);
    if( !userAddressDb ) {
        return apiResponse.error(res, httpStatusCode.NOT_FOUND, "UserAddress not found with specific id.");
    }

    userAddressDb.deletedAt = new Date();
    userAddressDb.save();

    return apiResponse.success(res, userAddressDb); 
  } 
  catch (error) {
      console.log(error);
      return apiResponse.error(res, httpStatusCode.INTERNAL_SERVER, error); 
  }
};

module.exports = {
  getUserAddress,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
};
