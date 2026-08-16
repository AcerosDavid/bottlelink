import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { startWorkers, stopWorkers } from './jobs';

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(API_PREFIX, apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database
initializeDatabase();

// Start workers
let workers: any;

async function startServer() {
  try {
    // Start background workers (cron-based, no Redis needed)
    workers = await startWorkers();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`BotellaLink API server running on port ${PORT}`);
      console.log(`API endpoint: http://localhost:${PORT}${API_PREFIX}`);
      console.log('Workers started successfully (no Redis required)');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down gracefully...');

  try {
    await stopWorkers(workers);
    console.log('Workers stopped');
  } catch (error) {
    console.error('Error stopping workers:', error);
  }

  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
startServer();

export default app;
