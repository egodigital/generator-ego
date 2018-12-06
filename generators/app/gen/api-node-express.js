// generator-ego (https://github.com/egodigital/generator-ego)
// Copyright (C) 2018  e.GO Digital GmbH, Aachen, Germany
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const fs = require('fs');
const sanitizeFilename = require('sanitize-filename');

const AUTH_BEARER = 'Bearer (by key)';
const AUTH_NONE = 'None';
const DB_MONGO = '🍃  MongoDB';
const DB_NONE = 'None';
const NPM_MODULE_JOI = 'joi';
const NPM_MODULE_LODASH = 'lodash';
const NPM_MODULE_MOMENTJS = 'Moment.js';

/**
 * A generator for Node.js based APIs (Express).
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('api-node-express');

    const NAME = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the NAME of your project:`, {
                validator: true,
            }
        )
    ).trim();
    if ('' === NAME) {
        return;
    }

    const NAME_LOWER = NAME.toLowerCase();
    const NAME_INTERNAL = NAME_LOWER.split(' ')
        .join('-');
    const FILE_NAME = sanitizeFilename(NAME_LOWER);

    const DESCRIPTION = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter a DESCRIPTION for your project:`, {
                default: '',
            }
        )
    ).trim();

    // database backend
    const DATABASE = this.tools.toStringSafe(
        await this.tools.promptList(
            `What DATABASE BACKEND to you like to use?`,
            [ DB_NONE, DB_MONGO ],
            {
                default: DB_MONGO,
            }
        )
    ).trim();
    if ('' === DATABASE) {
        return;
    }

    const MODULES = await this.tools.promptMultiSelect(
        'Which MODULES do you need?',
        [
            {
                'name': NPM_MODULE_JOI,
                'checked': true,
            },
            {
                'name': NPM_MODULE_LODASH,
                'checked': true,
            },
            {
                'name': NPM_MODULE_MOMENTJS,
                'checked': true,
            }
        ]
    );

    // database backend
    const AUTH_TYPE = this.tools.toStringSafe(
        await this.tools.promptList(
            `What kind of AUTHORIZATION is required?`,
            [ AUTH_NONE, AUTH_BEARER ],
            {
                default: AUTH_BEARER,
            }
        )
    ).trim();
    if ('' === AUTH_TYPE) {
        return;
    }

    const OPTS = {
        'auth_type': AUTH_TYPE,
        'database': DATABASE,
        'modules': MODULES,
    };

    // create output directory
    const OUT_DIR = this.tools
        .mkDestinationDir(NAME_LOWER);

    // copy all files
    {
        const FILES_TO_EXCLUDE = [
        ];
        if (DB_MONGO !== OPTS.database) {
            FILES_TO_EXCLUDE.push('/src/mongodb.ts');
        }

        this.tools.copy(
            TEMPLATES_DIR, OUT_DIR,
            null,
            FILES_TO_EXCLUDE
        );
    }

    this.log(`Generating 'package.json' ...`);
    const PACKAGE_JSON = createPackageJson(OPTS);
    {
        PACKAGE_JSON.name = NAME_INTERNAL;
        PACKAGE_JSON.description = DESCRIPTION;

        PACKAGE_JSON.dependencies = this.tools
            .sortObjectByKey(PACKAGE_JSON.dependencies);
        PACKAGE_JSON.devDependencies = this.tools
            .sortObjectByKey(PACKAGE_JSON.devDependencies);

        fs.writeFileSync(
            OUT_DIR + '/package.json',
            JSON.stringify(PACKAGE_JSON, null, 4),
            'utf8'
        );
    }

    // src/index.ts
    this.log(`Generating 'src/index.ts' ...`);
    const INDEX_TS = createIndexTS(OPTS);
    {
        fs.writeFileSync(
            OUT_DIR + '/src/index.ts',
            INDEX_TS,
            'utf8'
        );
    }

    // src/contracts.ts
    this.log(`Generating 'src/contracts.ts' ...`);
    const CONTRACTS_TS = createContractsTS(OPTS);
    {
        fs.writeFileSync(
            OUT_DIR + '/src/contracts.ts',
            CONTRACTS_TS,
            'utf8'
        );
    }

    // docker-compose.yml
    this.log(`Generating 'docker-compose.yml' ...`);
    const DOCKER_COMPOSE_YML = createDockerComposeYml(OPTS);
    {
        fs.writeFileSync(
            OUT_DIR + '/docker-compose.yml',
            DOCKER_COMPOSE_YML,
            'utf8'
        );
    }

    // npm install
    this.tools.runNPMInstall(OUT_DIR);

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'node_modules/',
        'dist/',
    ]);

    // .env
    {
        const ENV = {
            'APP_ENV': 'dev',
            'APP_HOST': '0.0.0.0',
            'APP_PORT': 8080,
            'LOCAL_DEVELOPMENT': 'true',
        };

        if (AUTH_BEARER === OPTS.auth_type) {
            ENV['API_KEY'] = '';
        }

        if (DB_MONGO === OPTS.database) {
            ENV['MONGO_HOST'] = 'mongo';
            ENV['MONGO_PORT'] = '27017';
            ENV['MONGO_DB'] = FILE_NAME;
            ENV['MONGO_USER'] = '';
            ENV['MONGO_PASSWORD'] = '';
            ENV['MONGO_OPTIONS'] = '?useNewUrlParser=true';
        }

        this.tools.createEnv(OUT_DIR, this.tools.sortObjectByKey(
            ENV
        ));
    }

    // README.md
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            name_internal: NAME_INTERNAL,
            title: NAME,
        }
    );

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR, [ OUT_DIR + '/src/index.ts', OUT_DIR + '/src/api/v1/root.ts' ]);
};


// [CREATE] docker-compose.yml
function createDockerComposeYml(opts) {
    return `version: '3'

services:
${ DB_MONGO !== opts.database ? '' : `  mongo:
    image: mongo:3.6
    ports:
      - 27017:27017
    restart: always
    volumes:
      - /data/db
` }  backend:
    command: bash -c "npm install && npm run dev"
${ DB_MONGO !== opts.database ? '' : `    depends_on:
      - mongo
` }    env_file: .env
    image: node:carbon
    ports:
      - 80:80
      - 8080:8080
    volumes:
      - .:/usr/src/app
    working_dir: /usr/src/app
`;
}

// [CREATE] contracts.ts
function createContractsTS(opts) {
    const IMPORT_MAPPINGS = {
        'express': 'express'
    };

    let withDatabaseCode = '';
    let withDatabaseActionCode = '';
    if (DB_MONGO === opts.database) {
        withDatabaseCode = `
    /**
     * Invokes an action for an open database connection.
     *
     * @param {WithDatabaseAction<TResult>} action The action to invoke.
     *
     * @return {Promise<TResult>} The promise with the result of {action}.
     */
    withDatabase<TResult = any>(action: WithDatabaseAction<TResult>): Promise<TResult>;
`;

        withDatabaseActionCode = `
/**
 * Describes an action for a 'AppContext#withDatabase' method.
 *
 * @param {mongodb.Database} db The current database (connection).
 * @param {boolean} [useTransaction] Run in transaction or not. Default: (false)
 *
 * @return {TResult|Promise<TResult>} The result of that action.
 */
export type WithDatabaseAction<TResult = any> = (db: mongodb.Database, useTransaction?: boolean) => TResult | Promise<TResult>;
`;

        IMPORT_MAPPINGS['mongodb'] = './mongodb';
    }

    return `${ getTSHeader() }${ toImportList(IMPORT_MAPPINGS) }

/**
 * An API context.
 */
export interface ApiContext {
    /**
     * Stores the current host instance.
     */
    readonly host: express.Express;
${ withDatabaseCode }}
${ withDatabaseActionCode }`;
}

// [CREATE] index.ts
function createIndexTS(opts) {
    const IMPORT_MAPPINGS = {
        'api_v1_root': './api/v1/root',
        'contracts': './contracts',
        'egoose': '@egodigital/egoose',
        'express': 'express'
    };

    let authCode = '';
    if (AUTH_BEARER === opts.auth_type) {
        authCode = `
        // make a 'Bearer' check
        v1_ROOT.use(function(req, res, next) {
            // get api key from
            // 'API_KEY' environment variable
            const API_KEY = egoose.toStringSafe(process.env.API_KEY).trim();
            if ('' !== API_KEY) {
                const AUTHORIZATION = egoose.toStringSafe(req.headers['authorization']).trim();
                if (AUTHORIZATION.toLowerCase().startsWith('bearer ')) {
                    const API_KEY_FROM_CLIENT = AUTHORIZATION.substr(7).trim();
                    if ('' !== API_KEY_FROM_CLIENT) {
                        if (API_KEY_FROM_CLIENT === API_KEY) {
                            return next();  // does match
                        }
                    }
                }
            } else {
                if (egoose.IS_LOCAL_DEV) {
                    // not defined and
                    // we are local
                    return next();
                }
            }

            return res.status(401)
                .send();
        });
`;
    }

    let withDatabaseCode = '';
    if (DB_MONGO === opts.database) {
        withDatabaseCode = `
        withDatabase: async function(func, useTransaction?) {
            useTransaction = !!useTransaction;

            const DB = mongodb.Database
                .fromEnvironment();

            await DB.connect();

            let session: mongoose.ClientSession;
            if (useTransaction) {
                session = await DB.mongo.startSession();
            }

            try {
                if (session) {
                    session.startTransaction();
                }

                const RESULT = await func(DB);

                if (session) {
                    await session.commitTransaction();
                }

                return RESULT;
            } catch (e) {
                if (session) {
                    await session.abortTransaction();
                }

                throw e;
            } finally {
                await DB.disconnect();
            }
        },`;

        IMPORT_MAPPINGS['mongodb'] = './mongodb';
        IMPORT_MAPPINGS['mongoose'] = 'mongoose';
    }

    return `${ getTSHeader() }${ toImportList(IMPORT_MAPPINGS) }

type InitApiAction = (api: contracts.ApiContext, root: express.Router) => void;

function createHost() {
    const HOST = express();

    const CONTEXT: contracts.ApiContext = {
        host: HOST,${ withDatabaseCode }
    };

    // v1 API
    {
        const v1_ROOT = express.Router();
        HOST.use('/api/v1', v1_ROOT);
${ authCode }
        // extend that list if other
        // action for initializing endpoints
        const INIT_ACTION: InitApiAction[] = [
            api_v1_root.init,
        ];

        for (const ACTION of INIT_ACTION) {
            ACTION(CONTEXT, v1_ROOT);
        }
    }

    return HOST;
}

(async () => {
${ DB_MONGO !== opts.database ? '' : `    mongodb.initDatabase();

` }    const HOST = createHost();

    let port = parseInt(egoose.toStringSafe(process.env.APP_PORT).trim());
    if (isNaN(port)) {
        if (egoose.IS_LOCAL_DEV) {
            port = 8080;
        } else {
            port = 80;
        }
    }

    let host = egoose.toStringSafe(process.env.APP_HOST).trim();
    if ('' === host) {
        host = '0.0.0.0';
    }

    HOST.listen(port, host, () => {
        if (egoose.IS_LOCAL_DEV) {
            console.log(
                \`API now runs on http://\${host}:\${port} ...\`
            );
        }
    });
})();
`;
}

// [CREATE] package.json
function createPackageJson(opts) {
    const PACKAGE_JSON = {
        "name": null,
        "version": "0.0.1",
        "description": null,
        "main": "dist/index.js",
        "dependencies": {
            "@egodigital/egoose": "^3.4.1",
            "express": "^4.16.4"
        },
        "devDependencies": {
            "@types/express": "^4.16.0",
            "@types/mocha": "^5.2.5",
            "@types/node": "8.10.30",
            "assert": "^1.4.1",
            "mocha": "^5.2.0",
            "nodemon": "^1.18.7",
            "supertest": "^3.3.0",
            "ts-node": "^7.0.1",
            "tslint": "^5.11.0",
            "typescript": "^3.1.6"
        },
        "scripts": {
            "build": "tsc",
            "dev": "nodemon --watch 'src/**/*.ts' --ignore 'src/**/*.spec.ts' --exec ts-node src/index.ts",
            "start": "node dist/index.js"
        },
        "author": "<AUTHOR>",
        "license": "<LICENSE>"
    };
    
    if (DB_MONGO === opts.database) {
        PACKAGE_JSON.devDependencies['@types/mongoose'] = '5.2.17';
    }

    if (opts.modules.indexOf(NPM_MODULE_JOI) > -1) {
        PACKAGE_JSON.devDependencies['@types/joi'] = '^14.0.0';
        PACKAGE_JSON.dependencies['joi'] = '^14.3.0';
    }
    if (opts.modules.indexOf(NPM_MODULE_LODASH) > -1) {
        PACKAGE_JSON.devDependencies['@types/lodash'] = '^4.14.119';
        PACKAGE_JSON.dependencies['lodash'] = '^4.17.11';
    }
    if (opts.modules.indexOf(NPM_MODULE_MOMENTJS) > -1) {
        PACKAGE_JSON.dependencies['moment'] = '^2.22.2';
    }

    return PACKAGE_JSON;
}

function getTSHeader() {
    return `/**
 * Generated by 'generator-ego' (https://github.com/egodigital/generator-ego)
 *
 * by e.GO Digital GmbH, Aachen, Germany (https://e-go-digital.com)
 */

`;
}

function toImportList(importMappings) {
    const IMPORTS = [];
    for (const IM of Object.keys(importMappings)) {
        IMPORTS.push(
            `import * as ${ IM } from '${ importMappings[IM] }';`
        );
    }

    return IMPORTS.sort()
        .join('\n');
}
