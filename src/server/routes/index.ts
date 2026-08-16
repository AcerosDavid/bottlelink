import { Router } from 'express';
import linksRouter from './links';
import providersRouter from './providers';
import statisticsRouter from './statistics';

const router = Router();

// API routes
router.use('/links', linksRouter);
router.use('/providers', providersRouter);
router.use('/statistics', statisticsRouter);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'BotellaLink API is running' });
});

export default router;
