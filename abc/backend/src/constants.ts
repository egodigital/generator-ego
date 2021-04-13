/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';

/**
 * File extensions of Node.js scripts.
 */
export const SCRIPT_EXT = path.extname(__filename);

/**
 * TCP port used by the backend.
 */
export const BACKEND_PORT = parseInt(process.env.BACKEND_PORT?.trim() || '80');

/**
 * Node environment.
 */
export const NODE_ENV = process.env.NODE_ENV?.toLowerCase().trim() || 'production';
/**
  * Is running in development mode or not.
  */
export const IS_DEV = NODE_ENV === 'development';
/**
  * Is running in production mode or not.
  */
export const IS_PROD = NODE_ENV === 'production';

/**
 * Is local development or not.
 */
export const IS_LOCAL_DEV = process.env.LOCAL_DEVELOPMENT?.toLowerCase().trim() === '1';

/**
 * Redis host address.
 */
export const REDIS_HOST = process.env.REDIS_HOST?.trim() || 'localhost';
/**
  * Redis TCP port.
  */
export const REDIS_PORT = parseInt(process.env.REDIS_PORT?.trim() || '6379');
