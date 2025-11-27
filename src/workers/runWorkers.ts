
import { createMainWorker } from "./mainWorker";
import { redisOptions } from "./redisOptions";

const main = createMainWorker(redisOptions, 1);
  
const workers = [
  { name: 'main', instance: main },
];

workers.forEach(({ name, instance }) => {
      console.log(` = = = = = = = = = =. >>>>> Worker: [${name}] created and listening for jobs.`);
  instance.on('completed', (job) => {
    console.log(`Worker: [${name}] Job ${job.id} completed`);
  });
  
  instance.on('failed', (job, err) => {
    console.error(`Worker: [${name}] Job ${job?.id} failed:`, err.message);
  });
  
  instance.on('active', (job) => {
    console.log(`Worker: [${name}] Starting job ${job.id}`);
  });
  
  instance.on('stalled', () => {
    console.warn(`Worker: [${name}] Job stalled`);
  });
});
