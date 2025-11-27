import { Worker, Job } from 'bullmq';
import { RedisOptions } from 'ioredis/built/redis/RedisOptions';

import { safe, testHeavyAsyncOperation } from './utils';
import { BULL_PREFIX, MAIN_JOB_TYPES, MAIN_QUEUE_NAME } from './queues/mainQueue';

export function createMainWorker(connectionOptions: RedisOptions, concurrency: number = 2): Worker {
  // for prformance testing 
  // const queue = new Queue('xtremepush-queue', {
  //   connection: {
  //     ...connectionOptions,
  //     maxRetriesPerRequest: null,
  //   },
  //   prefix: BULL_PREFIX,
  // });

  const worker = new Worker(MAIN_QUEUE_NAME, processorFn, {
    connection: {
      ...connectionOptions,
      maxRetriesPerRequest: null,
    },
    prefix: BULL_PREFIX,
    concurrency: concurrency,
    limiter: { max: 10, duration: 1000 },
  });

  async function processorFn(job: Job): Promise<{ op: string; }> {
    console.log(' - - - -Heavy operation  - - - - --  -', job.name, job.data);
    if (job.name === MAIN_JOB_TYPES.HEAVY_OPERATION) {
      // const counts = await queue.getJobCounts();
      // console.log(` worker - Main; Queue status - Waiting: ${counts.waiting}, Active: ${counts.active}, Completed: ${counts.completed}, Failed: ${counts.failed}`);
      const result = await safe(testHeavyAsyncOperation(2000, false, 0, job.data));
      console.log(' - - - -Heavy operation  - - - - --  -', result);


      return { op: MAIN_JOB_TYPES.HEAVY_OPERATION };
    }

    throw new Error(`Unknown job type: ${job.name}`);
  }

  return worker;
}


