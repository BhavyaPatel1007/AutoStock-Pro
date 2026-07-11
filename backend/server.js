const app = require('./src/app');
const config = require('./src/config/env');

const server = app.listen(config.PORT, () => {
  console.log(`AutoStock-Pro running on port ${config.PORT} [${config.NODE_ENV}]`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION — shutting down');
  console.error(err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION — shutting down');
  console.error(err);
  process.exit(1);
});
