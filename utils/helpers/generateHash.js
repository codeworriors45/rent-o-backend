const { scrypt, randomBytes } = require('crypto');
const { promisify } = require('util');
const scryptAsync = promisify(scrypt);


var generateHash = {

    hash : async(givenString) => {
        let salt = randomBytes(8).toString('hex');
        let hash = await scryptAsync(givenString, salt, 32);
        return `${hash.toString('hex')}`;        
    }
}

module.exports = generateHash;
