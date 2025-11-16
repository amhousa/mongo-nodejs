'use strict'
const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

module.exports = function (app, opts) {
  app.use(express.json()); // مهم

  // static
  app.use(express.static(path.join(__dirname, 'public')));

  // Swagger
  const options = { customCssUrl: '/custom.css' };
  app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

  // Register auth routes
  app.use("/v1/auth", require("./routes/auth"));
};
