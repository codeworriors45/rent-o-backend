const validateUser = (req, res, next) => {    
    const user = req["user"]
    if(!user){
        return apiResponse.error(res, 401, "Not authorized!");
    }
    return next();
}
module.exports = {
    validateUser
}