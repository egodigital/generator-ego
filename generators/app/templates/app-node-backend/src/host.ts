import * as expressControllers from '@egodigital/express-controllers';
import * as path from 'path';
import * as swagger from './swagger';
import { AppContext } from './contracts';


/**
 * Initializes the host.
 *
 * @param {AppContext} app The application context.
 */
export async function initHost(app: AppContext) {
    const SCRIPT_EXT = path.extname(__filename);

    expressControllers.initControllers({
        app: app.host,
        controllerConstructorArgs: function () {
            arguments[0] = app;  // update __app argument (1st)

            return arguments;
        },
        cwd: __dirname + '/controllers',
        files: '**/*' + SCRIPT_EXT,
        swagger: swagger.createSwaggerOptions(app),
    });
}