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
        "main": "./dist/electron/main.js",
        "scripts": {
            "build": "(rm -r ./out || true) && node .electron-vue/build.js && electron-builder",
            "build:dir": "(rm -r ./out || true) && node .electron-vue/build.js && electron-builder --dir -mwl",
            "dev": "node .electron-vue/dev-runner.js",
            "pack": "npm run pack:main && npm run pack:renderer",
            "pack:main": "cross-env NODE_ENV=production webpack --progress --colors --config .electron-vue/webpack.main.config.js",
            "pack:renderer": "cross-env NODE_ENV=production webpack --progress --colors --config .electron-vue/webpack.renderer.config.js",
            "postinstall": ""
        },
        "build": {
            "productName": null,
            "appId": "com.example.yourapp",
            "directories": {
                "output": "build"
            },
            "files": [
                "dist/electron/**/*"
            ],
            "dmg": {
            "contents": [
                {
                    "x": 410,
                    "y": 150,
                    "type": "link",
                    "path": "/Applications"
                },
                {
                    "x": 130,
                    "y": 150,
                    "type": "file"
                }
            ]
            },
            "mac": {
                "icon": "build/icons/icon.icns"
            },
            "win": {
                "icon": "build/icons/icon.ico"
            },
            "linux": {
                "icon": "build/icons"
            }
        },
        "dependencies": {
            "@egodigital/egoose": "^3.4.1",
            "axios": "^0.18.0",
            "bootstrap-css-only": "^4.1.1",
            "joi": "^14.3.0",
            "lodash": "^4.17.11",
            "mdbvue": "^4.8.2",
            "moment": "^2.22.2",
            "moment-timezone": "^0.5.23",
            "vue": "^2.5.16",
            "vue-electron": "^1.0.6",
            "vue-router": "^3.0.1",
            "vuex": "^3.0.1",
            "vuex-electron": "^1.0.0"
        },
        "devDependencies": {
            "ajv": "^6.5.0",
            "babel-core": "^6.26.3",
            "babel-loader": "^7.1.4",
            "babel-plugin-transform-runtime": "^6.23.0",
            "babel-preset-env": "^1.7.0",
            "babel-preset-stage-0": "^6.24.1",
            "babel-register": "^6.26.0",
            "babili-webpack-plugin": "^0.1.2",
            "cfonts": "^2.1.2",
            "chalk": "^2.4.1",
            "copy-webpack-plugin": "^4.5.1",
            "cross-env": "^5.1.6",
            "css-loader": "^0.28.11",
            "del": "^3.0.0",
            "devtron": "^1.4.0",
            "electron": "^2.0.4",
            "electron-debug": "^1.5.0",
            "electron-devtools-installer": "^2.2.4",
            "electron-builder": "^20.19.2",
            "mini-css-extract-plugin": "0.4.0",
            "file-loader": "^1.1.11",
            "html-webpack-plugin": "^3.2.0",
            "multispinner": "^0.2.1",
            "node-loader": "^0.6.0",
            "node-sass": "^4.9.2",
            "sass-loader": "^7.0.3",
            "style-loader": "^0.21.0",
            "url-loader": "^1.0.1",
            "vue-html-loader": "^1.2.4",
            "vue-loader": "^15.2.4",
            "vue-style-loader": "^4.1.0",
            "vue-template-compiler": "^2.5.16",
            "webpack-cli": "^3.0.8",
            "webpack": "^4.15.1",
            "webpack-dev-server": "^3.1.4",
            "webpack-hot-middleware": "^2.22.2",
            "webpack-merge": "^4.1.3"
        }
    };
}

/**
 * A generator for an Electron app.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('app-electron-mdbootstrap');

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

    // README
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME_AND_TITLE.title,
        }
    );

    this.log(`Setting up 'src/index.ejs' ...`);
    {
        const INDEX_EJS_SRC = TEMPLATES_DIR + '/src/index.ejs';
        const INDEX_EJS_DEST = OUT_DIR + '/src/index.ejs';

        const NEW_CONTENT = fs.readFileSync(
            INDEX_EJS_SRC,
            'utf8'
        ).split('{{ EGO-PAGE-TITLE }}')
         .join(this.tools.encodeHtml(NAME_AND_TITLE.title));

         fs.writeFileSync(
            INDEX_EJS_DEST,
            NEW_CONTENT,
            'utf8'
         );
    }

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR);
}
