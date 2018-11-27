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

function createPackageJson() {
    return {
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
            "@types/mongoose": "5.2.17",
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
}

/**
 * A generator for Node.js based APIs (Express).
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('api-node-express');

    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    // copy all files
    this.tools
        .copyAll(TEMPLATES_DIR, OUT_DIR);

    const PACKAGE_JSON = createPackageJson();
    PACKAGE_JSON.name = NAME_AND_TITLE.name;
    PACKAGE_JSON.description = NAME_AND_TITLE.title;

    fs.writeFileSync(
        OUT_DIR + '/package.json',
        JSON.stringify(PACKAGE_JSON, null, 4),
        'utf8'
    );

    // npm install
    this.tools.runNPMInstall(OUT_DIR);

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'node_modules/',
        'dist/',
    ]);

    // .env
    this.tools.createEnv(OUT_DIR, {
        'APP_ENV': 'dev',
        'APP_HOST': '0.0.0.0',
        'APP_PORT': 8080,
        'LOCAL_DEVELOPMENT': 'true',
    });

    // README
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME_AND_TITLE.title,
        }
    );

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR, [ OUT_DIR + '/src/index.ts', OUT_DIR + '/src/api/v1/root.ts' ]);
};
