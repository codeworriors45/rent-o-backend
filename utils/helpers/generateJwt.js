const jwt = require('jsonwebtoken');

const generateJWT = ( payload ) => {
    return new Promise( (resolve, reject) => {

        jwt.sign(payload, process.env.JWT_SECRETKEY, {
            expiresIn: process.env.JWT_EXPIRE || '72h'
        }, (error, token) => {
            if(error){
                console.log(error);
                reject('Token could not be generated');
            }
            else{
                resolve(token);
            }
        })
    });
}

module.exports = {
    generateJWT
}