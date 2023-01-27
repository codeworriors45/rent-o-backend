const jwt = require("jsonwebtoken")
const decodeJWT = async (token) => {
  const privateKey = process.env.JWT_SECRETKEY;
  try {
    const decoded = await jwt.verify(token, privateKey);
    return {
      valid: true,
      decoded,
    };
  } catch (error) {
    console.log(error)
    return {
      valid: false,
      decoded: null,
    };
  }
};
const validateJwt = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return next();
  }
  const { decoded, valid } = await decodeJWT(accessToken);  
  var now = Math.floor(Date.now() / 1000);

  if( now > decoded?.exp) {
      return next();
  }

  if (valid) {
    req.user = decoded;
    return next();
  }
  return next();
};
module.exports = {
  validateJwt,
};
