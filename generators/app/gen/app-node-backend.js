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

function createPackageJson(opts) {
    return {
        "name": null,
        "version": "0.0.1",
        "description": null,
        "main": "dist/index.js",
        "scripts": {
            "build": "(rm -r ./dist || true) && tsc && (mkdir ./dist/res) && (cp -r ./src/res/* ./dist/res)",
            "build:start": "npm run build && npm run start",
            "dev": "nodemon --watch 'src/**/*.ts' --ignore 'src/**/*.spec.ts' --exec node -r ts-node/register src/index.ts",
            "start": "node dist/index.js",
            "test": "echo \"Error: no test specified\" && exit 1",
            "update:all": "ego node-install -u -a && cd webapp && ego node-install -u -a"
        },
        "author": "",
        "license": "ISC",
        "dependencies": {
            "@egodigital/egoose": "^6.11.0",
            "@egodigital/express-controllers": "^4.6.0",
            "@egodigital/nef": "^1.0.0",
            "accepts": "^1.3.7",
            "express": "^4.17.1",
            "express-session": "^1.16.2",
            "fs-extra": "^8.1.0",
            "i18next": "^17.0.11",
            "lodash": "^4.17.15",
            "moment": "^2.24.0",
            "moment-timezone": "^0.5.26",
            "nocache": "^2.1.0",
            "reflect-metadata": "^0.1.13",
            "sanitize-filename": "^1.6.2",
            "typeorm": "^0.2.18",
            "xml2js": "^0.4.19"
        },
        "devDependencies": {
            "@egodigital/tsconfig": "^1.3.0",
            "@types/accepts": "^1.3.5",
            "@types/express": "^4.17.0",
            "@types/express-session": "^1.15.13",
            "@types/fs-extra": "^8.0.0",
            "@types/i18next": "^12.1.0",
            "@types/lodash": "^4.14.136",
            "@types/moment-timezone": "^0.5.12",
            "@types/node": "^10.14.15",
            "@types/sanitize-filename": "^1.1.28",
            "@types/xml2js": "^0.4.4",
            "ego-cli": "^0.74.1",
            "nodemon": "^1.19.1",
            "ts-node": "^8.3.0",
            "tslint": "^5.18.0",
            "typedoc": "^0.15.0",
            "typescript": "3.4.5"
        }
    };
}

function createWebAppPackageJson(opts) {
    return {
        "name": null,
        "description": null,
        "version": "0.0.1",
        "scripts": {
            "dev": "vue-cli-service serve --port 3000",
            "build": "vue-cli-service build"
        },
        "dependencies": {
            "@fortawesome/fontawesome-free": "^5.8.2",
            "core-js": "^2.6.5",
            "roboto-fontface": "*",
            "vue": "^2.6.10",
            "vue-router": "^3.0.3",
            "vuetify": "^2.0.0",
            "vuex": "^3.0.1"
        },
        "devDependencies": {
            "@vue/cli-plugin-babel": "^3.9.0",
            "@vue/cli-service": "^3.9.0",
            "node-sass": "^4.9.0",
            "sass": "^1.17.4",
            "sass-loader": "^7.1.0",
            "vue-cli-plugin-vuetify": "^0.6.1",
            "vue-template-compiler": "^2.6.10",
            "vuetify-loader": "^1.2.2"
        },
        "postcss": {
            "plugins": {
                "autoprefixer": {}
            }
        },
        "browserslist": [
            "> 1%",
            "last 2 versions"
        ]
    };
}

// information about that generator
exports.about = {
    displayName: 'Backend (Node - MVC)',
    icon: '🛠',
};

/**
 * A generator for Express MVC apps with an API and a web app.
 */
exports.run = async function () {
    const TEMPLATES_DIR = this.templatePath('app-node-backend');
    const TEMPLATES_DIR_WEBAPP = TEMPLATES_DIR + '/webapp';

    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const NAME = NAME_AND_TITLE.name;
    const NAME_LOWER = NAME.toLowerCase();
    const NAME_INTERNAL = NAME_LOWER.split(' ')
        .join('-');
    const TITLE = NAME_AND_TITLE.title;

    const DESCRIPTION = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter a DESCRIPTION for your project:`, {
                default: '',
            }
        )
    ).trim();

    const INSTALL_VUE_CLI = await this.tools.confirm(
        `Install Vue CLI?`, {
            default: false,
        }
    );

    // create output directory
    const OUT_DIR = this.tools
        .mkDestinationDir(NAME_LOWER);
    const OUT_DIR_WEBAPP = OUT_DIR + '/webapp';

    const OPTS = {
        description: DESCRIPTION,
        name: NAME_INTERNAL,
    };

    const FILES_TO_OPEN_IN_VSCODE = [];

    if (INSTALL_VUE_CLI) {
        this.log(`Installing Vue CLI ...`);
        this.spawnCommandSync('npm', ['install', '@vue/cli', '-g'], {
            'cwd': OUT_DIR
        });
    }

    const GENERATE_FILE = (file, func) => {
        return this.tools.withSpinner(
            `Generating '${file}' ...`,
            async (spinner) => {
                try {
                    const RESULT = await Promise.resolve(
                        func(spinner)
                    );

                    spinner.succeed(`File '${file}' generated.`);

                    return RESULT;
                } catch (e) {
                    spinner.fail(`Could not generate file '${file}': ${this.tools.toStringSafe(e)}`);

                    process.exit(1);
                }
            }
        );
    };

    // copy all files
    this.tools.copy(
        TEMPLATES_DIR,
        OUT_DIR,
        ['**'],
    );

    // package.json (backend)
    await GENERATE_FILE('package.json', () => {
        const PACKAGE_JSON = createPackageJson(OPTS);

        PACKAGE_JSON.name = NAME_INTERNAL + '-backend';
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
    // package.json (web app)
    await GENERATE_FILE('webapp/package.json', () => {
        const PACKAGE_JSON = createWebAppPackageJson(OPTS);

        PACKAGE_JSON.name = NAME_INTERNAL + '-webapp';
        PACKAGE_JSON.description = DESCRIPTION;

        PACKAGE_JSON.dependencies = this.tools
            .sortObjectByKey(PACKAGE_JSON.dependencies);
        PACKAGE_JSON.devDependencies = this.tools
            .sortObjectByKey(PACKAGE_JSON.devDependencies);

        fs.writeFileSync(
            OUT_DIR_WEBAPP + '/package.json',
            JSON.stringify(PACKAGE_JSON, null, 4),
            'utf8'
        );
    });
    await GENERATE_FILE('webapp/public/index.html', () => {
        const INDEX_HTML_SRC = TEMPLATES_DIR_WEBAPP + '/public/index.html';
        const INDEX_HTML_DEST = OUT_DIR_WEBAPP + '/public/index.html';

        const NEW_CONTENT = fs.readFileSync(
            INDEX_HTML_SRC,
            'utf8'
        ).split('{{ EGO-PAGE-TITLE }}')
            .join(this.tools.encodeHtml(TITLE));

        fs.writeFileSync(
            INDEX_HTML_DEST,
            NEW_CONTENT,
            'utf8'
        );
    });

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        '.DS_Store',
        'node_modules/',
        'dist/',
        'doc/',
    ]);
    // .gitignore (web app)
    this.tools.createGitIgnore(OUT_DIR_WEBAPP, [
        '.DS_Store',
        'node_modules',
        '/dist',
        '.env.local',
        '.env.*.local',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        '.idea',
        '*.suo',
        '*.ntvs*',
        '*.njsproj',
        '*.sln',
        '*.sw*',
    ]);

    // .env
    {
        const ENV = {
            'APP_ENV': 'dev',
            'APP_HOST': '0.0.0.0',
            'APP_MONITORING_KEY': 'ego',
            'APP_PORT': 80,
            'LOCAL_DEVELOPMENT': 'true',
            'MONGO_DB': NAME_INTERNAL.split('-')
                .join('_'),
            'MONGO_HOST': 'mongo',
            'MONGO_PASSWORD': '',
            'MONGO_PORT': '27017',
            'MONGO_USER': '',
            'REDIS_HOST': 'redis',
            'REDIS_HOST_PORT': '6379',
            'SESSION_SECRET': 'ego',
        };

        this.tools.createEnv(OUT_DIR, this.tools.sortObjectByKey(
            ENV
        ));
    }

    // README.md
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            'name_internal': NAME_INTERNAL,
            'title': NAME,
        }
    );

    // npm install
    this.tools.runNPMInstall(OUT_DIR);
    this.tools.runNPMInstall(OUT_DIR_WEBAPP);

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools.askForOpenVSCode(
        OUT_DIR,
        FILES_TO_OPEN_IN_VSCODE,
    );
};
