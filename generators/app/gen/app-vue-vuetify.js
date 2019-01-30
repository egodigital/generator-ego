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
    return {
        "name": null,
        "description": null,
        "version": "0.0.1",
        "scripts": {
            "dev": "vue-cli-service serve",
            "build": "vue-cli-service build",
            "lint": "vue-cli-service lint"
        },
        "dependencies": {
            "material-design-icons-iconfont": "^3.0.3",
            "roboto-fontface": "*",
            "vue": "^2.5.21",
            "vue-router": "^3.0.1",
            "vuetify": "^1.3.0",
            "vuex": "^3.0.1"
        },
        "devDependencies": {
            "@vue/cli-plugin-babel": "^3.3.0",
            "@vue/cli-plugin-eslint": "^3.3.0",
            "@vue/cli-service": "^3.3.0",
            "babel-eslint": "^10.0.1",
            "eslint": "^5.8.0",
            "eslint-plugin-vue": "^5.0.0",
            "stylus": "^0.54.5",
            "stylus-loader": "^3.0.1",
            "vue-cli-plugin-vuetify": "^0.4.6",
            "vue-template-compiler": "^2.5.21",
            "vuetify-loader": "^1.0.5"
        }
    };
}

/**
 * A generator for Vue based web pages with Vuetify.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('app-vue-vuetify');

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
        'node_modules/',
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
