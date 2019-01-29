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

const ejs = require('ejs');
const fs = require('fs');

function createPackageJSON(opts) {
    return {
        "name": null,
        "version": "5.0.0",
        "description": null,
        "author": "<AUTHOR>",
        "license": "<LICENSE>",
        "scripts": {
            "dev": "webpack-dev-server --inline --progress --config build/webpack.dev.conf.js --open",
            "start": "yarn-or-npm run dev",
            "mdb": "webpack-dev-server --inline --progress --config demo_build/webpack.dev.conf.js --open",
            "demo": "yarn-or-npm run mdb",
            "remove-demo": "del-cli demo demo_build",
            "lint": "eslint --ext .js,.vue src",
            "build": "node build/build.js"
        },
        "dependencies": {
            "bootstrap-css-only": "^4.2.1",
            "mdbvue": "^5.0.0",
            "vue": "^2.5.21",
            "vue-router": "^3.0.2"
        },
        "devDependencies": {
            "autoprefixer": "^7.1.2",
            "babel-core": "^6.22.1",
            "babel-eslint": "^8.2.1",
            "babel-helper-vue-jsx-merge-props": "^2.0.3",
            "babel-loader": "^7.1.1",
            "babel-plugin-syntax-jsx": "^6.18.0",
            "babel-plugin-transform-runtime": "^6.22.0",
            "babel-plugin-transform-vue-jsx": "^3.5.0",
            "babel-preset-env": "^1.3.2",
            "babel-preset-stage-2": "^6.22.0",
            "chalk": "^2.0.1",
            "copy-webpack-plugin": "^4.0.1",
            "css-loader": "^0.28.0",
            "del-cli": "^1.1.0",
            "eslint": "^4.15.0",
            "eslint-config-standard": "^10.2.1",
            "eslint-friendly-formatter": "^3.0.0",
            "eslint-loader": "^2.1.1",
            "eslint-plugin-html": "^4.0.5",
            "eslint-plugin-import": "^2.7.0",
            "eslint-plugin-node": "^5.2.0",
            "eslint-plugin-promise": "^3.4.0",
            "eslint-plugin-standard": "^3.0.1",
            "eslint-plugin-vue": "^4.0.0",
            "eslint-plugin-vue-libs": "^3.0.0",
            "extract-text-webpack-plugin": "^4.0.0-beta.0",
            "file-loader": "^1.1.4",
            "friendly-errors-webpack-plugin": "^1.6.1",
            "html-webpack-plugin": "^3.2.0",
            "node-notifier": "^5.1.2",
            "optimize-css-assets-webpack-plugin": "^3.2.0",
            "ora": "^1.2.0",
            "portfinder": "^1.0.13",
            "postcss-import": "^11.0.0",
            "postcss-loader": "^2.0.8",
            "postcss-url": "^7.2.1",
            "rimraf": "^2.6.0",
            "semver": "^5.3.0",
            "shelljs": "^0.7.6",
            "uglifyjs-webpack-plugin": "^1.1.1",
            "url-loader": "^0.5.8",
            "vue-loader": "^14.2.2",
            "vue-style-loader": "^3.0.1",
            "vue-template-compiler": "^2.5.21",
            "webpack": "^4.19.1",
            "webpack-bundle-analyzer": "^3.0.2",
            "webpack-cli": "^3.1.0",
            "webpack-dev-server": "^3.1.8",
            "webpack-merge": "^4.1.4",
            "yarn-or-npm": "^2.0.4"
        },
        "engines": {
            "node": ">= 6.0.0",
            "npm": ">= 3.0.0"
        },
        "browserslist": [
            "> 1%",
            "last 2 versions",
            "not ie <= 8"
        ]
    };      
}

/**
 * A generator for Vue based web pages with MD Bootstrap Free.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('app-vue-mdbootstrap');

    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const DESCRIPTION = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter a DESCRIPTION for your project:`, {
                default: '',
            }
        )
    ).trim();

    const NAME = NAME_AND_TITLE.name;
    const NAME_LOWER = NAME.toLowerCase();
    const NAME_INTERNAL = NAME_LOWER.split(' ')
        .join('-');
    const TITLE = NAME_AND_TITLE.title;

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    const OPTS = {
    };

    const FILES_TO_OPEN_IN_VSCODE = [
    ];

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

    // copy all files
    this.tools.copy(
        TEMPLATES_DIR,
        OUT_DIR,
        [ '**' ],
        [ '/index.ejs' ]
    );

    // package.json
    await GENERATE_FILE('package.json', () => {
        const PACKAGE_JSON = createPackageJSON(OPTS);

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

    // index.html
    await GENERATE_FILE('index.html', () => {
        const CONTENT = fs.readFileSync(
            TEMPLATES_DIR + '/index.ejs',
            'utf8'
        );

        fs.writeFileSync(
            OUT_DIR + '/index.html',
            ejs.render(CONTENT, {
                'page_title': TITLE
            }),
            'utf8'
        );
    });

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        '.DS_Store',
        'node_modules/',
        '/dist/',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
        'yarn.lock',
        '.idea',
        '*.suo',
        '*.ntvs*',
        '*.njsproj',
        '*.sln',
    ]);

    // README.md
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME,
        }
    );

    // npm install
    this.tools
        .runNPMInstall(OUT_DIR);

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools.askForOpenVSCode(
        OUT_DIR,
        FILES_TO_OPEN_IN_VSCODE,
    );
}
