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

function createIndexHtml(opts) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>${ this.tools.encodeHtml(opts.title)}</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but ${ this.tools.encodeHtml(opts.title)} doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>`;
}

function createPackageJSON(opts) {
    if (opts.typescript) {
        return {
            "name": opts.name,
            "version": "0.0.1",
            "description": opts.title,
            "scripts": {
                "serve": "vue-cli-service serve",
                "build": "vue-cli-service build",
                "electron:build": "vue-cli-service electron:build",
                "electron:serve": "vue-cli-service electron:serve",
                "dev": "npm run electron:serve",
                "postinstall": "electron-builder install-app-deps",
                "postuninstall": "electron-builder install-app-deps"
            },
            "main": "background.js",
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
                "electron": "^6.0.0",
                "node-sass": "^4.9.0",
                "sass": "^1.17.4",
                "sass-loader": "^7.1.0",
                "typescript": "^3.4.3",
                "vue-cli-plugin-electron-builder": "^1.4.0",
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
        "name": opts.name,
        "version": "0.0.1",
        "description": opts.title,
        "scripts": {
            "serve": "vue-cli-service serve",
            "build": "vue-cli-service build",
            "electron:build": "vue-cli-service electron:build",
            "electron:serve": "vue-cli-service electron:serve",
            "dev": "npm run electron:serve",
            "postinstall": "electron-builder install-app-deps",
            "postuninstall": "electron-builder install-app-deps"
        },
        "main": "background.js",
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
            "electron": "^5.0.0",
            "node-sass": "^4.9.0",
            "sass": "^1.17.4",
            "sass-loader": "^7.1.0",
            "vue-cli-plugin-electron-builder": "^1.3.6",
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
    displayName: 'App (Electron - Vuetify ^2.0)',
    icon: '🖥',
};

/**
 * A generator for an Electron app with vuetify.
 */
exports.run = async function () {
    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const OPTS = {
        name: NAME_AND_TITLE.name,
        title: NAME_AND_TITLE.title,
    };

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

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

    const TEMPLATES_DIR = OPTS.typescript ?
        this.templatePath('app-electron-vuetify-ts') : this.templatePath('app-electron-vuetify-js');

    // copy all files
    this.tools
        .copyAll(TEMPLATES_DIR, OUT_DIR);

    const PACKAGE_JSON = createPackageJSON(OPTS);

    fs.writeFileSync(
        OUT_DIR + '/package.json',
        JSON.stringify(PACKAGE_JSON, null, 4),
        'utf8'
    );

    // npm install
    this.tools
        .runNPMInstall(OUT_DIR);

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'node_modules/',
        'dist_electron/',
    ]);

    // README
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME_AND_TITLE.title,
        }
    );

    this.log(`Setting up 'public/index.html' ...`);
    {
        const INDEX_HTML_DEST = OUT_DIR + '/public/index.html';

        const NEW_CONTENT = createIndexHtml.apply(
            this, [OPTS]
        );

        fs.writeFileSync(
            INDEX_HTML_DEST,
            NEW_CONTENT,
            'utf8'
        );
    }

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR);
}
