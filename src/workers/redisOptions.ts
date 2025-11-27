import { RedisOptions } from "ioredis";
import * as dotenv from "dotenv";

// Load .env file for workers (since they don't have access to Fastify instance)
dotenv.config();

function parseRedisConnectionString(connectionString: string): RedisOptions {
  // Parse Azure Redis connection string format:
  // host:port,password=xxx,ssl=True,abortConnect=False

  const [hostSegment, ...remainingSegments] = connectionString.split(",");
  const [host, port] = hostSegment.split(":");
  const params = remainingSegments.join(",");

  const passwordMatch = params.match(/password=([^,]*),ssl=/);
  const password = passwordMatch ? passwordMatch[1] : undefined;

  const sslMatch = params.match(/ssl=([^,]*)/);
  const ssl = sslMatch ? sslMatch[1].toLowerCase() === "true" : false;

  const options: RedisOptions = {
    host,
    port: parseInt(port),
    password,
    tls: ssl ? {} : undefined,
    retryStrategy: (times: number) => Math.min(times * 10, 2000),
    maxRetriesPerRequest: 3,
  };

  // IMPORTANT: Do not use ioredis keyPrefix with BullMQ
  // options.keyPrefix = "fastify-worker:";

  return options;
}

// Use REDIS_CONNECTION_STRING from environment (loaded from .env or production env vars)
export const redisOptions: RedisOptions = process.env.REDIS_CONNECTION_STRING
  ? parseRedisConnectionString(process.env.REDIS_CONNECTION_STRING)
  : {
      // Default for local development without Redis
      host: "localhost",
      port: 6379,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    };
