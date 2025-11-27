export const configSchema = {
  type: 'object',
  required: [],
  properties: {
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    PORT: {
      type: 'number',
      default: 3000
    },
    HOST: {
      type: 'string',
      default: '0.0.0.0'
    },
    REDIS_CONNECTION_STRING: {
      type: 'string',
      default: ''
    }
  }
}

export interface Config {
  NODE_ENV: string
  PORT: number
  HOST: string
  REDIS_CONNECTION_STRING: string
}
