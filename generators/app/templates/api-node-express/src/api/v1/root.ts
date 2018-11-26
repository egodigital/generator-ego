import * as contracts from '../../contracts';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';

/**
 * Initializes the 'root' endpoints.
 *
 * @param {contracts.ApiContext} api The underlying API context.
 * @param {express.Router} root The root endpoint.
 */
export function init(api: contracts.ApiContext, root: express.Router) {
    root.get('/', async function(req, res) {
        return egoose.sendResponse(res, {
            success: true,
            data: await egoose.createMonitoringApiResult(),
        });
    });

    root.post('/', express.json(), async function(req, res) {
        return egoose.sendResponse(res, {
            success: true,
            data: {
                echo: req.body,
            },
        });
    });
}
