import cron from 'node-cron';
import { LinkCheckService } from '../services';
import { LinkModel } from '../models';

// Simple in-memory job queue without Redis
class SimpleJobQueue {
  private jobs: Map<string, cron.ScheduledTask> = new Map();
  private pendingChecks: Set<number> = new Set();

  /**
   * Schedule a link check
   */
  scheduleLinkCheck(linkId: number, delayMinutes: number = 0) {
    if (this.pendingChecks.has(linkId)) {
      return; // Already scheduled
    }

    this.pendingChecks.add(linkId);

    if (delayMinutes > 0) {
      // Schedule for later
      const delayMs = delayMinutes * 60 * 1000;
      setTimeout(() => {
        this.executeLinkCheck(linkId);
      }, delayMs);
    } else {
      // Execute immediately
      this.executeLinkCheck(linkId);
    }
  }

  /**
   * Execute a link check
   */
  private async executeLinkCheck(linkId: number) {
    try {
      await LinkCheckService.checkLinkNow(linkId);
    } catch (error) {
      console.error(`Error checking link ${linkId}:`, error);
    } finally {
      this.pendingChecks.delete(linkId);

      // Reschedule based on link's check frequency
      const link = LinkModel.findById(linkId);
      if (link && link.check_frequency > 0) {
        this.scheduleLinkCheck(linkId, link.check_frequency);
      }
    }
  }

  /**
   * Schedule recurring checks for all links
   */
  scheduleAllLinks() {
    const links = LinkModel.findAll();

    for (const link of links) {
      if (link.check_frequency > 0) {
        this.scheduleLinkCheck(link.id, link.check_frequency);
      }
    }
  }

  /**
   * Setup cron job for periodic checks
   */
  setupPeriodicChecks() {
    // Run every minute to check for links that need checking
    const task = cron.schedule('* * * * *', () => {
      this.scheduleAllLinks();
    });

    this.jobs.set('periodic-checks', task);
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    for (const [name, task] of this.jobs) {
      task.stop();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }
}

export const jobQueue = new SimpleJobQueue();
