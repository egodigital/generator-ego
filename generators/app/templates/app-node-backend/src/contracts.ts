import * as egoose from '@egodigital/egoose';
import { Express } from 'express';
import { Connection } from "typeorm";

/**
 * An application context.
 */
export interface AppContext {
    /**
     * The (Express) host instance.
     */
    readonly host: Express;
    /**
     * The app logger.
     */
    readonly logger: egoose.Logger;
    /**
     * The package.json
     */
    readonly package: PackageJSON;
    /**
     * Invokes an action with an open database connection.
     * 
     * @param {WithDatabaseAction<TResult>} action The action to invoke.
     * 
     * @return {Promise<TResult>} The promise with the result of the action.
     */
    readonly withDatabase: <TResult extends any = any>(action: WithDatabaseAction<TResult>) => Promise<TResult>;
}

/**
 * Describes a package.json file.
 */
export interface PackageJSON {
    /**
     * The description of the package.
     */
    readonly description: string;
    /**
     * The name of the package.
     */
    readonly name: string;
    /**
     * The version of the package.
     */
    readonly version: string;
}

/**
 * An action for a 'withDatabase()' method.
 *
 * @param {Connection} conn The connection.
 *
 * @return {TResult|PromiseLike<TResult>} The result of the action.
 */
export type WithDatabaseAction<TResult extends any = any> =
    (conn: Connection) => TResult | PromiseLike<TResult>;