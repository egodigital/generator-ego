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

const DB_MONGO = '🍃  MongoDB';
const DB_NONE = 'None';

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

    const OPTS = {
        'database': DATABASE
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

        if (DB_MONGO === OPTS.database) {
            ENV['MONGO_HOST'] = 'mongo';
            ENV['MONGO_PORT'] = '27017';
            ENV['MONGO_DB'] = FILE_NAME;
            ENV['MONGO_USER'] = '';
            ENV['MONGO_PASSWORD'] = '';
            ENV['MONGO_OPTIONS'] = '?useNewUrlParser=true';
        }

        this.tools
            .createEnv(OUT_DIR, ENV);
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

function createIndexTS(opts) {
    return `import * as api_v1_root from './api/v1/root';
import * as contracts from './contracts';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
${ DB_MONGO === opts.database ? "import * as mongodb from './mongodb';" : '' }

type InitApiAction = (api: contracts.ApiContext, root: express.Router) => void;

function createHost() {
    const HOST = express();

    const CONTEXT: contracts.ApiContext = {
        host: HOST,
    };

    // v1 API
    {
        const v1_ROOT = express.Router();
        HOST.use('/api/v1', v1_ROOT);

        v1_ROOT.use(function(req, res, next) {
            // overwrite this, if you would like
            // to implement an authorization
            // workflow, e.g.

            return next();
        });

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
        port = 8080;
    }

    let host = egoose.toStringSafe(process.env.APP_HOST).trim();
    if ('' === host) {
        host = '0.0.0.0';
    }

    HOST.listen(port, host, () => {
        console.log(
            \`API now runs on http://\${host}:\${port} ...\`
        );
    });
})();`;
}

function createPackageJson(opts) {
    const PACKAGE_JSON = {
        "name": null,
        "version": "0.0.1",
        "description": null,
        "main": "dist/index.js",
        "dependencies": {
            "@egodigital/egoose": "^3.4.1",
            "express": "^4.16.4",
            "express-session": "^1.15.6",
            "joi": "^13.7.0",
            "lodash": "^4.17.11"
        },
        "devDependencies": {
            "@types/express": "^4.16.0",
            "@types/express-session": "^1.15.11",
            "@types/joi": "^13.6.3",
            "@types/lodash": "^4.14.118",
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

    return PACKAGE_JSON;
}

    