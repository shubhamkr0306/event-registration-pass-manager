const app = require('./app');
const env = require('./config/env');
const { initDb } = require('./config/db');

const startServer = async () => {
  try {
    // 1. Initialize PostgreSQL database and tables
    await initDb();

    // 2. Start HTTP server
    const server = app.listen(env.PORT, () => {
      console.log(`[Server Running]: http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server]: Gracefully shutting down...');
      server.close(() => {
        console.log('[Server]: Closed all active connections.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('[Server Startup Failure]:', error);
    process.exit(1);
  }
};

startServer();
