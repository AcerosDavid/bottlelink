import { Router } from 'express';
import { StatisticsController } from '../controllers';

const router = Router();

// Get overall statistics
router.get('/overall', StatisticsController.getOverallStatistics);

// Get provider statistics
router.get('/providers', StatisticsController.getProviderStatistics);

// Get link statistics
router.get('/links/:id', StatisticsController.getLinkStatistics);

// Get recent activity
router.get('/activity', StatisticsController.getRecentActivity);

// Get status distribution
router.get('/distribution/status', StatisticsController.getStatusDistribution);

// Get file type distribution
router.get('/distribution/filetypes', StatisticsController.getFileTypeDistribution);

// Get time-based statistics
router.get('/timebased', StatisticsController.getTimeBasedStats);

export default router;
