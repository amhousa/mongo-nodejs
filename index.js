'use strict';

const express = require('express');
const httpErrors = require('http-errors');
const path = require('path');
const ejs = require('ejs');
const pino = require('pino');
const pinoHttp = require('pino-http');
const initDB = require('./db/init');

initDB();

module.exports = function createServer(options = {}) {
  const opts = {
    port: options.port || 3000,
    host: options.host || '0.0.0.0',
    ...options
  };

  const logger = pino();

  let server;
  let isStarted = false;
  let isClosing = false;

  // ---------- Global Error Handlers ----------
  function handleFatal(err) {
    logger.error(err);

    if (isClosing) return;
    isClosing = true;

    if (isStarted && server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  }

  process.on('uncaughtException', handleFatal);
  process.on('unhandledRejection', handleFatal);

  // ---------- Express App ----------
  const app = express();

  // Template Engine
  app.engine('html', ejs.renderFile);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'html');

  // Middlewares
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Routes Loader
  require('./routes')(app, opts);

  // ---------- 404 Handler ----------
  app.use((req, res, next) => {
    next(httpErrors(404, `Route not found: ${req.url}`));
  });

  // ---------- 500 Handler ----------
  app.use((err, req, res, next) => {
    if (err.status >= 500) logger.error(err);
    res.locals.name = 'mongodb-expressjs-books';
    res.locals.error = err;
    res.status(err.status || 500).render('error');
  });

  // ---------- Start Server ----------
  server = app.listen(opts.port, opts.host, err => {
    if (err) {
      logger.error("Failed to start server:", err);
      return;
    }

    if (isClosing) {
      logger.error("Server closed before fully starting.");
      return;
    }

    isStarted = true;
    const addr = server.address();
    logger.info(`🚀 Server started on http://${opts.host}:${addr.port}`);
  });

  return app;
};
