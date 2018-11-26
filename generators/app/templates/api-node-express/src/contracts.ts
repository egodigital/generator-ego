import * as express from 'express';

/**
 * An API context.
 */
export interface ApiContext {
    /**
     * Stores the current host instance.
     */
    readonly host: express.Express;
}
