"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const env_1 = __importDefault(require("@fastify/env"));
const config_1 = require("./config");
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
        server.get('/health', async (request, reply) => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });
        server.get('/', async (request, reply) => {
            return { message: 'Fastify server is running' };
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