import Fastify, { FastifyInstance } from 'fastify';
import fastifyEnv from '@fastify/env';
import { configSchema, Config } from './config';

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

    // Health check endpoint
    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Main route
    server.get('/', async (request, reply) => {
      return { message: 'Fastify server is running' };
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
