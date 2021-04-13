import { ControllerBase as ECControllerBase } from '@egodigital/express-controllers';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { IApp } from '../app';

/**
 * An extended request object.
 */
export interface Request extends ExpressRequest {
}

/**
 * An extended response object.
 */
export interface Response extends ExpressResponse {
}

/**
 * Stores and handle the result of a controller result.
 */
export class ControllerResult {
    /**
     * The HTTP status code.
     */
    public code = 200;
    /**
     * The data to return.
     */
    public data: any;

    /**
     * The function, that returns the data to return.
     *
     * @returns {any} The data to return.
     */
    public getData = (): any => this.data;
}

/**
 * A basic controller.
 */
export abstract class ControllerBase extends ECControllerBase<IApp> {
}
