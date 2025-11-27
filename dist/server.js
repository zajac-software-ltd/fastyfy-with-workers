"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const env_1 = __importDefault(require("@fastify/env"));
const config_1 = require("./config");
const mainQueue_1 = require("./workers/queues/mainQueue");
const server = (0, fastify_1.default)({
    logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
    }
});
const start = async () => {
    try {
        await server.register(env_1.default, {
            schema: config_1.configSchema,
            dotenv: true
        });
        (0, mainQueue_1.startQueueSizeLogging)(server.log, 30000);
        server.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });
        server.get('/', async (request, reply) => {
            return { message: 'Fastify server is running' };
        });
        server.get('/test/heavy-operation', async (request, reply) => {
            const jobId = await (0, mainQueue_1.addHeavyJob)({ payload: "Test payload nonsense" });
            return {
                message: 'Job queued successfully',
                jobId,
            };
        });
        server.get('/test/purge', async (request, reply) => {
            await (0, mainQueue_1.purgeQueue)();
            return {
                message: 'Queue purged successfully',
            };
        });
        server.get('/queue/stats', async (request, reply) => {
            const stats = await (0, mainQueue_1.getQueueStats)();
            return stats;
        });
        server.delete('/queue/purge', async (request, reply) => {
            const result = await (0, mainQueue_1.purgeQueue)();
            return result;
        });
        await server.listen({ port: server.config.PORT, host: server.config.HOST });
        server.log.info(`Server listening on ${server.config.HOST}:${server.config.PORT}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
const gracefulShutdown = async () => {
    try {
        (0, mainQueue_1.stopQueueSizeLogging)();
        await server.close();
        server.log.info('Server closed gracefully');
        process.exit(0);
    }
    catch (err) {
        server.log.error(err, 'Error during shutdown');
        process.exit(1);
    }
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
start();
//# sourceMappingURL=server.js.map