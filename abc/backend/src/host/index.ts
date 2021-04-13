import cors from 'cors';
import express from 'express';
import nocache from 'nocache';
import path from 'path';
import { initControllers } from '@egodigital/express-controllers';
import { IApp } from '../app';
import { IS_LOCAL_DEV, SCRIPT_EXT } from '../constants';
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
        files: ['**/*' + SCRIPT_EXT],
        controllerConstructorArgs: function () {
            arguments[0] = app;  // update __app argument (1st)

            return arguments;
        },
        swagger: await createSwaggerOptions(app)
    });

    // this all has be done at last!!!
    setupWebApp(app);
}

function setupWebApp(app: IApp) {
    if (IS_LOCAL_DEV) {
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
