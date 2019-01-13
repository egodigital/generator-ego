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

const NPM_MODULE_LODASH = 'lodash';
const NPM_MODULE_MOMENTJS = 'Moment.js';

function createPackageJson(opts) {
    const PACKAGE_JSON = {
        "name": null,
        "version": "0.0.1",
        "description": null,
        "author": "<AUTHOR>",
        "license": "<LICENSE>",
        "main": "dist/index.js",
        "dependencies": {
            "@egodigital/egoose": "^3.6.0"
        },
        "devDependencies": {
            "@types/node": "^8.10.39",
            "tslint": "^5.12.1",
            "typescript": "^3.2.2"
        },
        "scripts": {
            "build": "./node_modules/.bin/tsc",
            "start": "node dist/index.js"
        }
    };

    if (opts.modules.indexOf(NPM_MODULE_LODASH) > -1) {
        PACKAGE_JSON.devDependencies['@types/lodash'] = '^4.14.119';
        PACKAGE_JSON.dependencies['lodash'] = '^4.17.11';
    }
    if (opts.modules.indexOf(NPM_MODULE_MOMENTJS) > -1) {
        PACKAGE_JSON.dependencies['moment'] = '^2.22.2';
    }

    return PACKAGE_JSON;
}

/**
 * A generator for empty Node.js applications, written in TypeScript.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('app-node-typescript');

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

    const MODULES = await this.tools.promptMultiSelect(
        'Which MODULES do you need?',
        [
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

    // create output directory
    const OUT_DIR = this.tools
        .mkDestinationDir(NAME_LOWER);

    const OPTS = {
        'modules': MODULES,
    };

    const GENERATE_FILE = (file, func) => {
        return this.tools.withSpinner(
            `Generating '${ file }' ...`,
            async (spinner) => {
                try {
                    const RESULT = await Promise.resolve(
                        func(spinner)
                    );

                    spinner.succeed(`File '${ file }' generated.`);

                    return RESULT;
                } catch (e) {
                    spinner.fail(`Could not generate file '${ file }': ${ this.tools.toStringSafe(e) }`);

                    process.exit(1);
                }
            }  
        );
    };

    const FILES_TO_OPEN_IN_VSCODE = [
        OUT_DIR + '/src/index.ts',
    ];    

    // copy all files
    {
        const FILES_TO_EXCLUDE = [
        ];

        this.tools.copy(
            TEMPLATES_DIR, OUT_DIR,
            null,
            FILES_TO_EXCLUDE
        );
    }

    await GENERATE_FILE('package.json', () => {
        const PACKAGE_JSON = createPackageJson(OPTS);

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
    });

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'node_modules/',
        'dist/',
    ]);

    // README.md
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME,
        }
    );

    // npm install
    this.tools.runNPMInstall(OUT_DIR);

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools.askForOpenVSCode(
        OUT_DIR,
        FILES_TO_OPEN_IN_VSCODE,
    );
}
