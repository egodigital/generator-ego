import * as _ from 'lodash';
import * as accepts from 'accepts';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as expressControllers from '@egodigital/express-controllers';
import * as xml2js from 'xml2js';
import * as yaml from 'js-yaml';
import { AppContext } from '../contracts';

/**
 * An extended request context.
 */
export interface Request extends express.Request {
}

/**
 * An extended response context.
 */
export interface Response extends express.Response {
}

/**
 * A base controller.
 */
export abstract class ControllerBase extends expressControllers.ControllerBase<AppContext> {
    /** @inheritdoc */
    public async __error(context: expressControllers.RequestErrorHandlerContext<Request>) {
        let name: string;
        let message: string;
        let details: any;
        if (context.error instanceof Error) {
            name = context.error.name;
            message = context.error.message;
            details = context.error.stack;
        } else {
            message = egoose.toStringSafe(context.error);
        }

        this.__app.logger.err({
            details,
            headers: context.request.headers,
            message,
            method: context.request.method,
            name,
            params: context.request.params,
            url: context.request.originalUrl,
        }, `request(${context.request.path})`);

        return sendResponse(
            context.request, context.response as Response,
            {
                success: false,
                data: {
                    name,
                    message,
                    details,
                },
            },
            500,
        );
    }

    /** @inheritdoc */
    public async __updateSwaggerPath(context: expressControllers.SwaggerPathDefinitionUpdaterContext) {
        if (_.isNil(context.definition.responses)) {
            context.definition.responses = {};
        }

        if (context.hasAuthorize) {
            if (_.isNil(context.definition.responses['403'])) {
                context.definition.responses['403'] = {
                    "description": "No permissions",
                };
            }
        }

        if (_.isNil(context.definition.responses['500'])) {
            context.definition.responses['500'] = {
                "description": "Server error",
            };
        }
    }
}

/**
 * Sends a formatted response, based on the 'accept' request header.
 *
 * @param {Request} req The request context.
 * @param {Response} res The response context. 
 * @param {any} valueToSend The value to send.
 * @param {number} [code] The custom response code. Default: 200
 */
export function sendResponse(
    req: Request, res: Response,
    valueToSend: any,
    code: number = 200,
) {
    const ACCEPTS = accepts(req);

    switch (ACCEPTS.type(['json', 'xml', 'yaml'])) {
        case 'yaml':
            return res
                .status(code)
                .header('Content-type', 'application/x-yaml; charset=utf-8')
                .send(Buffer.from(
                    yaml.safeDump(valueToSend),
                    'utf8',
                ));

        case 'xml':
            // tslint:disable-next-line
            {
                const XML_BUILDER = new xml2js.Builder({
                    async: false,
                    rootName: 'result',
                });

                return res.status(code)
                    .header('Content-type', 'text/xml; charset=utf-8')
                    .send(Buffer.from(
                        XML_BUILDER.buildObject(valueToSend),
                        'utf8',
                    ));
            } // xml
    }

    // JSON
    return res.status(code)
        .header('Content-type', 'application/json; charset=utf-8')
        .send(Buffer.from(
            JSON.stringify(valueToSend),
            'utf8',
        ));
}