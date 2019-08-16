import * as egoose from '@egodigital/egoose';
import * as fs from 'fs-extra';
import * as path from 'path';
import { InitControllersSwaggerOptionsValue } from '@egodigital/express-controllers';
import { AppContext } from './contracts';
import { getResourcePath } from './util';

/**
 * Creates Swagger options for 'initControllers()' function.
 *
 * @param {AppContext} app The underlying application (context),
 * 
 * @return {InitControllersSwaggerOptionsValue} The options value.
 */
export function createSwaggerOptions(app: AppContext): InitControllersSwaggerOptionsValue {
    // @TODO: replace data from generator

    return (egoose.IS_LOCAL_DEV || egoose.IS_DEV) ? {
        definitions: DEFINITIONS,
        document: {
            host: 'localhost',
            info: {
                contact: {
                    email: 'hello@e-go-digital.com',
                },
                description: 'Describes all backend endpoints.',
                title: 'Backend',
                version: app.package.version,
            },
            schemes: [egoose.IS_LOCAL_DEV ? 'http' : 'https'],
            tags: {
                'default': 'Default endpoints',
            },
        },

        title: 'Backend',
    } : false;
}


const DEFINITIONS: any = {};
if (egoose.IS_LOCAL_DEV) {
    const DEFINITIONS_DIR = getResourcePath(
        'swagger/definitions'
    );
    for (const DEF_FILE of fs.readdirSync(DEFINITIONS_DIR)) {
        try {
            const FULL_PATH = path.join(
                DEFINITIONS_DIR, DEF_FILE
            );

            if (!fs.statSync(FULL_PATH).isFile()) {
                continue;
            }

            if (!DEF_FILE.endsWith('.json')) {
                continue;
            }

            const DEF_NAME = path.basename(
                DEF_FILE, path.extname(DEF_FILE)
            ).trim();
            if ('' !== DEF_FILE) {
                DEFINITIONS[DEF_NAME] = JSON.parse(
                    fs.readFileSync(FULL_PATH, 'utf8')
                );

                console.log(`✅✅✅  Loaded Swagger definition from '${
                    DEF_FILE
                    }'  ✅✅✅`);
            }
        } catch (e) {
            console.log(`⚠️⚠️⚠️  Could not load Swagger definition from '${
                DEF_FILE
                }': '${
                egoose.toStringSafe(e)
                }'  ⚠️⚠️⚠️`);
        }
    }
}