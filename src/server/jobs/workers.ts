import { jobQueue } from './queue';

// Simple worker system without Redis
export async function startWorkers() {
  console.log('Starting workers...');

  // Setup periodic checks using cron
  jobQueue.setupPeriodicChecks();

  // Schedule initial checks for existing links
  jobQueue.scheduleAllLinks();

  console.log('Workers started successfully');

  return {
    jobQueue
  };
}

export async function stopWorkers(workers: any) {
  console.log('Stopping workers...');

  if (workers?.jobQueue) {
    workers.jobQueue.stopAll();
  }

  console.log('Workers stopped');
}
