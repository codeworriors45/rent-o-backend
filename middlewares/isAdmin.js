const isAdmin = (req,res,next) => {
    const user = req['user'];
    if(!user) {
        return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "Unauthorized request");
    }

    if(user.type !== 'ADMIN') {
        return apiResponse.error(res, httpStatusCode.UNAUTHORIZED, "Invalid role!");
    }

    return next();
}

module.exports = { isAdmin };