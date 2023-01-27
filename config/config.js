require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbConnection = async() => {
    
    const customSuccessfulMessage = "Postgres DB connection has been established successfully.";
    const customError = "Unable to connect to the database: ";
    
    try {       
        const sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: process.env.DB_DIALECT
        });        
        sequelize.authenticate()
        .then(() => {
            console.log(customSuccessfulMessage);
        })
        .catch((error) =>
            console.error(customError, error)
        );
    
    }
    catch( error ){        
        console.error(customError, error)
        throw new Error(customError);
    }
}

module.exports =
{ 
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT    
    },
    dbConnection
};
