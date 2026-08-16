import type { Request, Response } from 'express';
import { StatisticsService } from '../services';

export class StatisticsController {
  /**
   * Get overall statistics
   */
  static async getOverallStatistics(_req: Request, res: Response) {
    try {
      const statistics = StatisticsService.getOverallStatistics();
      res.json({ success: true, data: statistics });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get provider statistics
   */
  static async getProviderStatistics(_req: Request, res: Response) {
    try {
      const statistics = StatisticsService.getProviderStatistics();
      res.json({ success: true, data: statistics });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get link statistics
   */
  static async getLinkStatistics(req: Request, res: Response) {
    try {
      const linkId = parseInt(req.params.id as string);
      const statistics = StatisticsService.getLinkStatistics(linkId);
      res.json({ success: true, data: statistics });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activity = StatisticsService.getRecentActivity(limit);
      res.json({ success: true, data: activity });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get status distribution
   */
  static async getStatusDistribution(_req: Request, res: Response) {
    try {
      const distribution = StatisticsService.getStatusDistribution();
      res.json({ success: true, data: distribution });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get file type distribution
   */
  static async getFileTypeDistribution(_req: Request, res: Response) {
    try {
      const distribution = StatisticsService.getFileTypeDistribution();
      res.json({ success: true, data: distribution });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Get time-based statistics
   */
  static async getTimeBasedStats(req: Request, res: Response) {
    try {
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      const stats = StatisticsService.getTimeBasedStats(hours);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}
