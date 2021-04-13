import fs from 'fs';
import { IPackageJSON } from '@egodigital/types';
import { Express } from 'express';
import { Logger } from 'winston';
import { logger } from './diagnostics';

const readFile = fs.promises.readFile;

/**
 * An application context.
 */
export interface IApp {
    /**
     * The underlying host.
     */
    readonly host: Express;
    /**
     * The app wide logger.
     */
    readonly log: Logger;
    /**
     * The underlying package.json file.
     */
    readonly package: IPackageJSON;
}

/**
 * Creates a new application context for an Express instance.
 *
 * @param {Express} host The Express instance.
 *
 * @returns {Promise<IApp>} The promise with the new app context.
 */
export async function createApp(host: Express): Promise<IApp> {
    return {
        host,
        log: logger,
        package: JSON.parse(
            await readFile(
                __dirname + '/../package.json',
                'utf8'
            )
        )
    };
}
