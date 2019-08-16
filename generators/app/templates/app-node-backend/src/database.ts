import * as egoose from '@egodigital/egoose';
import * as path from 'path';
import { Connection, getConnectionManager } from "typeorm";

/**
 * Creates a new database connection.
 * 
 * @return {Connection} The new connection.
 */
export function createDatabaseConnection(): Connection {
    const CONN_MANAGER = getConnectionManager();

    return CONN_MANAGER.create({
        database: egoose.toStringSafe(process.env.MONGO_DB)
            .trim(),
        entities: [
            __dirname + '/entities/*' + path.extname(__filename),
        ],
        host: egoose.toStringSafe(process.env.MONGO_HOST)
            .trim(),
        logging: egoose.IS_LOCAL_DEV,
        password: egoose.isEmptyString(process.env.MONGO_PASSWORD) ?
            undefined : egoose.toStringSafe(process.env.MONGO_PASSWORD),
        port: parseInt(
            egoose.toStringSafe(process.env.MONGO_PORT)
                .trim()
        ),
        synchronize: true,
        type: "mongodb",
        useNewUrlParser: true,
        ssl: !egoose.IS_LOCAL_DEV,
        username: egoose.isEmptyString(process.env.MONGO_USER) ?
            undefined : egoose.toStringSafe(process.env.MONGO_USER).trim(),
    });
}
