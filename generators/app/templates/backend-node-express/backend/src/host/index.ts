import * as constants from '../constants';
import cors from 'cors';
import express from 'express';
import nocache from 'nocache';
import path from 'path';
import { initControllers } from '@egodigital/express-controllers';
import { IApp } from '../app';
import { createSwaggerOptions } from './swagger';

/**
 * Initializes the host instance of an app.
 *
 * @param {IAppContext} app The underlying app.
 */
export async function initHost(app: IApp) {
    const { host } = app;

    const corsConf = {
        origin: true,
        credentials: true
    };

    // CORS
    host.use(cors(corsConf));
    host.options('*', cors(corsConf) as any);

    // no cache
    host.use(nocache());

    initControllers({
        app: app.host,
        cwd: __dirname + '/../controllers',
        files: ['**/*' + constants.SCRIPT_EXT],
        controllerConstructorArgs: function () {
            arguments[0] = app;  // update __app argument (1st)

            return arguments;
        },
        swagger: await createSwaggerOptions(app)
    });
/// <frontend-79940f32-5a4b-4ed5-8c9e-d51ce43dd4d2>
    // this all has be done at last!!!
    setupWebApp(app);
/// </frontend-79940f32-5a4b-4ed5-8c9e-d51ce43dd4d2>
}
/// <frontend-b88a2f2f-75ea-43f5-8b20-55cda9f4b932>
function setupWebApp(app: IApp) {
    if (constants.IS_LOCAL_DEV) {
        return;
    }

    const { host } = app;

    const ROUTER = express.Router();

    ROUTER.use(
        express.static(
            path.join(__dirname, '../../../frontend/build'),
            {
                etag: false,
                maxAge: 0
            }
        )
    );

    host.use('/', ROUTER);
}
/// </frontend-b88a2f2f-75ea-43f5-8b20-55cda9f4b932>
