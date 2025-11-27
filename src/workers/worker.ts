import { Worker, Job } from 'bullmq';
import { redisOptions } from './redisOptions';
import { testHeavyAsyncOperation } from '../utils/testOperations';
import { MAIN_QUEUE_NAME, MAIN_JOB_TYPES, BULL_PREFIX } from './queues/mainQueue';

const worker = new Worker(
  MAIN_QUEUE_NAME,
  async (job: Job) => {
    // Check if job exists (prevent processing ghost jobs)
    // if (!job || !job.id) {
    //   console.warn('[Worker] Received job without ID, skipping...');
    //   return null;
    // }

    console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
    console.log(`[Worker] Job data:`, job.data);

    try {
      // Process different job types
      switch (job.name) {
        case MAIN_JOB_TYPES.HEAVY_OPERATION:
          // Simulate heavy processing
          const result = await testHeavyAsyncOperation(5000, false, 0.1);
          console.log(`[Worker] Job ${job.id} completed:`, result);
          return result;
        
        case MAIN_JOB_TYPES.MAIN_TASK:
          // Handle main task
          return { processed: true, data: job.data };
        
        case MAIN_JOB_TYPES.PRINT_MESSAGE:
          console.log(`[Worker] Message: ${job.data.message || 'No message provided'}`);
          return { printed: true };
        
        case MAIN_JOB_TYPES.API_CALL:
          // Handle API call task
          return { apiResponse: 'simulated response' };
        
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      // Log the error and rethrow to let BullMQ handle retries
      console.error(`[Worker] Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redisOptions,
    prefix: BULL_PREFIX,
    concurrency: 5,
    stalledInterval: 30000,
    maxStalledCount: 1,
  }
);

// Worker event listeners
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  // Check for missing key error
  if (err.message && err.message.includes('Missing key for job')) {
    console.error(`[Worker] Job ${job?.id} has missing keys in Redis, skipping...`);
    // Job is already gone, nothing to do
    return;
  }
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on('stalled', (jobId) => {
  console.warn(`[Worker] Job ${jobId} stalled and will be retried`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('[Worker] Shutting down gracefully...');
  await worker.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('[Worker] Worker started and listening for jobs...');
