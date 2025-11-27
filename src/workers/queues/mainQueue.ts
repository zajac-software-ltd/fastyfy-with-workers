import { Queue, QueueEvents } from 'bullmq';
import { redisOptions } from '../redisOptions';

export const MAIN_QUEUE_NAME = 'main-queue';
export const BULL_PREFIX = 'fastify-worker';

export const MAIN_JOB_TYPES = {
  MAIN_TASK: 'main-task',
  HEAVY_OPERATION: 'heavy-operation',
  PRINT_MESSAGE: 'print-message',
  API_CALL: 'api-call',
} as const;

const queue = new Queue(MAIN_QUEUE_NAME, {
  connection: redisOptions,
  prefix: BULL_PREFIX,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: {
      age: 60,
      count: 0
    },
  }
});

export const queueEvents = new QueueEvents(MAIN_QUEUE_NAME, {
  connection: redisOptions,
  prefix: BULL_PREFIX,
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[${MAIN_QUEUE_NAME}] Job ${jobId} failed:`, failedReason);
});

export async function addHeavyJob(data: unknown, delay?: number) {
  console.log('Adding heavy job with data:', data);
  const job = await queue.add(
    MAIN_JOB_TYPES.HEAVY_OPERATION,
    data,
    {
      delay: delay || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );

  return job.id;
}

export async function getQueueStats() {
  const counts = await queue.getJobCounts();

  return {
    waiting: counts.waiting,
    active: counts.active,
    completed: counts.completed,
    failed: counts.failed,
    delayed: counts.delayed,
  };
}

export async function getQueueCounts() {
  const c = await queue.getJobCounts();
  return {
    waiting: c.waiting,
    active: c.active,
    completed: c.completed,
    failed: c.failed,
    delayed: c.delayed,
    paused: c.paused,
    total: c.waiting + c.active + c.delayed,
  };
}

let queueSizeLoggerTimer: NodeJS.Timeout | undefined;

export function startQueueSizeLogging(
  logger: { info: (msg: any) => void; error?: (msg: any) => void },
  intervalMs = 30000
) {
  if (queueSizeLoggerTimer) return; // already running
  queueSizeLoggerTimer = setInterval(async () => {
    try {
      const counts = await getQueueCounts();
      logger.info({
        msg: 'Queue size snapshot',
        queue: MAIN_QUEUE_NAME,
        counts,
      });
    } catch (err) {
      logger.error?.({ msg: 'Queue size logging failed', err });
    }
  }, intervalMs);
}

export function stopQueueSizeLogging() {
  if (queueSizeLoggerTimer) {
    clearInterval(queueSizeLoggerTimer);
    queueSizeLoggerTimer = undefined;
  }
}

export async function purgeQueue() {
  await queue.drain();
  await queue.clean(0, 0, 'completed');
  await queue.clean(0, 0, 'failed');  
  await queue.clean(0, 0, 'delayed');
  await queue.clean(0, 0, 'waiting');
  await queue.clean(0, 0, 'active');
  await queue.clean(0, 0, 'paused');
  await queue.obliterate({ force: true });
}
