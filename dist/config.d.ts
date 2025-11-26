export declare const configSchema: {
    type: string;
    required: never[];
    properties: {
        NODE_ENV: {
            type: string;
            default: string;
        };
        PORT: {
            type: string;
            default: number;
        };
        HOST: {
            type: string;
            default: string;
        };
    };
};
export interface Config {
    NODE_ENV: string;
    PORT: number;
    HOST: string;
}
