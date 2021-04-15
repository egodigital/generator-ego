import * as path from 'path';
import { getConnectionManager as getTypeORMConnectionManager, Connection as TypeORMConnection } from 'typeorm';
import { tick } from '../utils';
import { IS_LOCAL_DEV, SCRIPT_EXT } from '../constants';
import { Nilable } from '@egodigital/types';

export const DEFAULT_TYPEORM_CONNECTION = 'default';

/**
 * Describes an action for a 'withDB()' function call.
 *
 * @param {TypeORMConnection} conn The current connection.
 *
 * @returns {TResult|PromiseLike<TResult>} The result of the action.
 */
export type WithDBAction<TResult extends any = any> =
    (conn: TypeORMConnection) => TResult | PromiseLike<TResult>;

/**
 * Returns a new TypeORM connection to the application database.
 *
 * @param {string} [connectionName] The custom connection name.
 *
 * @returns {Promise<TypeORMConnection>} The promise with the connection.
 */
export async function getDBConnection(connectionName = DEFAULT_TYPEORM_CONNECTION): Promise<TypeORMConnection> {
    const manager = getTypeORMConnectionManager();

    let conn: TypeORMConnection;
    if (manager.has(connectionName)) {
        conn = manager.get(connectionName);
    } else {
        conn = manager.create({
            name: 'default',
            type: 'postgres',

            ssl: !IS_LOCAL_DEV && '1' === process.env.DB_SSL,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,

            synchronize: false,
            logging: IS_LOCAL_DEV,

            entities: [
                path.join(
                    __dirname, './entity/*' + SCRIPT_EXT
                )
            ],

            migrations: [
                path.join(
                    __dirname, './migration/*' + SCRIPT_EXT
                )
            ],
            migrationsTableName: 'migrations',

            subscribers: [
                path.join(
                    __dirname, './subscriber/*' + SCRIPT_EXT
                )
            ]
        });
    }

    if (!conn.isConnected) {
        await conn.connect();
    }

    return conn;
}

/**
 * Invokes an action for an open database connection, and closes it after it is not used anymore.
 *
 * @param {WithDBAction<TResult>} action The action to invoke.
 * @param {TypeORMConnection} [connection] The custom connection to use.
 *
 * @returns {Promise<TResult>} The promise with the result of the action.
 */
export async function withDB<TResult extends any = any>(
    action: WithDBAction<TResult>, connection?: Nilable<TypeORMConnection>
): Promise<TResult> {
    return tick(async () => {
        if (!connection) {
            connection = await getDBConnection();
        }

        return action(connection);
    });
}
