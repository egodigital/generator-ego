import fs from 'fs';
import path from 'path';
import { InitControllersSwaggerOptionsValue } from '@egodigital/express-controllers';
import { IApp } from '../app';
import { IS_LOCAL_DEV } from '../constants';
import { logger } from '../diagnostics';
import { getResourcePath, toStringSafe } from '../utils';

const readdir = fs.promises.readdir;
const readFile = fs.promises.readFile;
const stat = fs.promises.stat;

/**
 * Creates the value for 'swagger' property of 'initControllers()' function.
 *
 * @param {IApp} app The application context.
 *
 * @returns {Promise<InitControllersSwaggerOptionsValue>} The promise with the value.
 */
export async function createSwaggerOptions(
    app: IApp
): Promise<InitControllersSwaggerOptionsValue> {
    if (!IS_LOCAL_DEV) {
        return false;
    }

    return {
        definitions: await loadSwaggerDefinitions(app),
        document: {
            host: 'localhost:8080',
            info: {
                contact: {
                    email: 'developer@e-go-digital.com'
                },
                description: 'Describes all CarThing endpoints.',
                title: 'Backend',
                version: app.package.version
            },
            schemes: [IS_LOCAL_DEV ? 'http' : 'https']
        },
        root: '/swagger',
        title: 'Swagger'
    };
}

async function loadSwaggerDefinitions(app: IApp): Promise<any> {
    const definitionsDir = getResourcePath(
        'swagger/definitions'
    );

    const definitions: any = {};

    if (IS_LOCAL_DEV) {
        for (const defFile of await readdir(definitionsDir)) {
            try {
                if (!defFile.endsWith('.json')) {
                    continue;
                }

                const fullPath = path.join(definitionsDir, defFile);

                if (!(await stat(fullPath)).isFile()) {
                    continue;
                }

                const defName = path.basename(defFile, path.extname(defFile)).trim();
                if (defFile.length) {
                    definitions[defName] = JSON.parse(
                        await readFile(fullPath, 'utf8')
                    );

                    logger.debug(`Loaded Swagger definition from '${defFile}'`, {
                        file: __filename,
                        func: 'loadSwaggerDefinitions'
                    });
                }
            } catch (e) {
                logger.warn(`Could not load Swagger definition from '${defFile}': '${toStringSafe(e)}'`, {
                    file: __filename,
                    func: 'loadSwaggerDefinitions'
                });
            }
        }
    }

    return definitions;
}
