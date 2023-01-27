const express = require('express');
const cors = require('cors');
var morgan = require('morgan');
const { dbConnection } = require('../config/config');
require('../utils/apiResponse');
require('../utils/httpStatusCode');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;

    //Connect to Database
    this.connectDB();

    //Middlewares
    this.middlewares();

    //Routes
    this.routes();
  }

  async connectDB() {
    await dbConnection();
  }

  middlewares() {
    //Cors
    this.app.use(cors());

    //Reading and parsing request body
    this.app.use(express.json({ limit: '50mb' }));

    //Public folder
    this.app.use(express.static('public'));

    this.app.use(morgan('tiny'));
  }

  routes() {
    const routeV1 = require('../routes/v1/index');
    const routeV2 = require('../routes/v2/index');
    const routeV3 = require('../routes/v3/index');
    this.app.use('/api/v1', routeV1);
    this.app.use('/api/v2', routeV2);
    this.app.use('/api/v3', routeV3);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running at `, this.port);
    });
  }
}

module.exports = Server;
