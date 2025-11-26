"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = void 0;
exports.configSchema = {
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
        }
    }
};
//# sourceMappingURL=config.js.map