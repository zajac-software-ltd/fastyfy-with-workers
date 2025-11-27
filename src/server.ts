import Fastify, { FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
import { configSchema, Config } from './config';

import { addHeavyJob, getQueueStats, purgeQueue, startQueueSizeLogging, stopQueueSizeLogging } from './workers/queues/mainQueue';

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

const server: FastifyInstance = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

const start = async () => {
  try {
    // Register env plugin
    await server.register(fastifyEnv, {
      schema: configSchema,
      dotenv: true
    });

    // Start periodic queue size logging (every 30s)
    startQueueSizeLogging(server.log, 30000);

    // Health check endpoint
    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Main route
    server.get('/', async (request, reply) => {
      return { message: 'Fastify server is running' };
    });

    // Test endpoint to add a job to the queue
    server.get('/test/heavy-operation', async (request, reply) => {
      const jobId = await addHeavyJob({payload:"Test payload nonsense"});
      // purgeQueue();
      return { 
        message: 'Job queued successfully', 
        jobId,
      };
    });
    server.get('/test/purge', async (request, reply) => {

      await purgeQueue();
      
      return { 
        message: 'Queue purged successfully', 
      };
    });
    // Get queue statistics
    server.get('/queue/stats', async (request, reply) => {
      const stats = await getQueueStats();
      return stats;
    });

    // Purge the queue completely
    server.delete('/queue/purge', async (request, reply) => {
      const result = await purgeQueue();
      return result;
    });

    await server.listen({ port: server.config.PORT, host: server.config.HOST });
    server.log.info(`Server listening on ${server.config.HOST}:${server.config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  try {
    stopQueueSizeLogging();
    await server.close();
    server.log.info('Server closed gracefully');
    process.exit(0);
  } catch (err) {
    server.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

start();
