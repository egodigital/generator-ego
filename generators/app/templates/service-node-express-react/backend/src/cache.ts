import _ from 'lodash';
import redis from 'redis';
import { promisify } from 'util';
import { logger } from './diagnostics';
import { ICache } from './types';
import { tick, toStringSafe } from './utils';

const REDIS_HOST = process.env.REDIS_HOST?.trim() || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT?.trim() || '6379');

const redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
});

redisClient.on('error', (error) => {
    logger.warn(`REDIS ERROR: ${toStringSafe(error)}`, {
        file: __filename
    });
});

const delAsync: any = promisify(redisClient.del).bind(redisClient);
const flushdbAsync: any = promisify(redisClient.flushdb).bind(redisClient);
const getAsync: any = promisify(redisClient.get).bind(redisClient);
const setAsync: any = promisify(redisClient.set).bind(redisClient);

/**
 * A Redis based cache implementation.
 */
export class RedisCache implements ICache {
    /**
     * @inheritdoc
     */
    public flush(): Promise<boolean> {
        return tick(async () => {
            try {
                return await flushdbAsync('ASYNC');
            } catch {
                return false;
            }
        });
    }

    /**
     * @inheritdoc
     */
    public get<TResult extends any = any>(key: string): Promise<TResult>;
    public get<TResult, TDefault>(key: string, defaultValue: TDefault): Promise<TResult | TDefault>;
    public get<TResult extends any = any, TDefault extends any = any>(key: string, defaultValue?: TDefault): Promise<TResult | TDefault | undefined> {
        return tick(async () => {
            try {
                const value = await getAsync(key);
                if (typeof value === 'string') {
                    return JSON.parse(value);
                }
            } catch { }

            return defaultValue;
        });
    }

    /**
     * @inheritdoc
     */
    public set(key: string, value: any, ttl: number | false = 3600): Promise<boolean> {
        return tick(async () => {
            try {
                if (_.isNil(value)) {
                    await delAsync(key);
                } else {
                    const jsonStr = JSON.stringify(value);

                    if (ttl === false) {
                        await setAsync(key, jsonStr);
                    } else {
                        await setAsync(key, jsonStr, 'EX', ttl);
                    }
                }

                return true;
            } catch {
                return false;
            }
        });
    }
}
