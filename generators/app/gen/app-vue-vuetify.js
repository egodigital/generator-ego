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

function createPackageJSON(opts) {
    if (opts.typescript) {
        return {
            "name": null,
            "description": null,
            "version": "0.0.1",
            "scripts": {
                "dev": "vue-cli-service serve",
                "build": "vue-cli-service build"
            },
            "dependencies": {
                "@fortawesome/fontawesome-free": "^5.8.2",
                "register-service-worker": "^1.6.2",
                "roboto-fontface": "*",
                "vue": "^2.6.10",
                "vue-class-component": "^7.0.2",
                "vue-property-decorator": "^8.1.0",
                "vue-router": "^3.0.3",
                "vuetify": "^2.0.0",
                "vuex": "^3.0.1"
            },
            "devDependencies": {
                "@vue/cli-plugin-pwa": "^3.10.0",
                "@vue/cli-plugin-typescript": "^3.10.0",
                "@vue/cli-service": "^3.10.0",
                "node-sass": "^4.9.0",
                "sass": "^1.17.4",
                "sass-loader": "^7.1.0",
                "typescript": "^3.4.3",
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

    return {
        "name": null,
        "description": null,
        "version": "0.0.1",
        "scripts": {
            "dev": "vue-cli-service serve",
            "build": "vue-cli-service build"
        },
        "dependencies": {
            "@fortawesome/fontawesome-free": "^5.8.2",
            "core-js": "^2.6.5",
            "register-service-worker": "^1.6.2",
            "roboto-fontface": "*",
            "vue": "^2.6.10",
            "vue-router": "^3.0.3",
            "vuetify": "^2.0.0",
            "vuex": "^3.0.1"
        },
        "devDependencies": {
            "@vue/cli-plugin-babel": "^3.9.0",
            "@vue/cli-plugin-pwa": "^3.9.0",
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

exports.about = {
    displayName: 'App (Vue - Vuetify ^2.0)',
    icon: '🌐',
};

/**
 * A generator for Vue based web pages with Vuetify.
 */
exports.run = async function () {
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

    const INSTALL_VUE_CLI = await this.tools.confirm(
        `Install Vue CLI?`, {
            default: false,
        }
    );

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

    const LANGUAGE = await this.tools.promptList(
        'Language:',
        ['TypeScript', 'JavaScript'],
        {
            default: 'TypeScript'
        }
    );
    if (!LANGUAGE) {
        return;
    }

    OPTS.typescript = 'TypeScript' === LANGUAGE;

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

    const TEMPLATES_DIR = OPTS.typescript ?
        this.templatePath('app-vue-vuetify-ts') : this.templatePath('app-vue-vuetify-js');

    // copy all files
    this.tools.copy(
        TEMPLATES_DIR,
        OUT_DIR,
        ['**'],
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

    await GENERATE_FILE('public/index.html', () => {
        const INDEX_HTML_SRC = TEMPLATES_DIR + '/public/index.html';
        const INDEX_HTML_DEST = OUT_DIR + '/public/index.html';

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