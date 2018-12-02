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

function createAppJson() {
    return {
        "expo": {
            "name": null,
            "description": null,
            "slug": null,
            "privacy": "public",
            "sdkVersion": "31.0.0",
            "platforms": ["ios", "android"],
            "version": "1.0.0",
            "orientation": "portrait",
            "icon": "./assets/icon.png",
            "splash": {
                "image": "./assets/splash.png",
                "resizeMode": "contain",
                "backgroundColor": "#ffffff"
            },
            "updates": {
                "fallbackToCacheTimeout": 0
            },
            "assetBundlePatterns": [
                "**/*"
            ],
            "ios": {
                "supportsTablet": true
            }
        }
    };      
}

function createPackageJson() {
    return {
        "name": null,
        "description": null,
        "main": "node_modules/expo/AppEntry.js",
        "private": true,
        "scripts": {
            "start": "expo start",
            "android": "expo start --android",
            "ios": "expo start --ios",
            "eject": "expo eject"
        },
        "dependencies": {
            "expo": "^31.0.2",
            "react": "16.5.0",
            "react-native": "https://github.com/expo/react-native/archive/sdk-31.0.0.tar.gz"
        },
        "devDependencies": {
            "babel-preset-expo": "^5.0.0"
        }
    }
}

/**
 * A generator for a blank React Native app.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('app-reactnative-blank');

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

    const APP_JSON = createAppJson();
    APP_JSON.expo.name = NAME_AND_TITLE.name;
    APP_JSON.expo.description = NAME_AND_TITLE.title;
    APP_JSON.expo.slug = NAME_AND_TITLE.name;

    fs.writeFileSync(
        OUT_DIR + '/app.json',
        JSON.stringify(APP_JSON, null, 4),
        'utf8'
    );

    // npm install
    this.tools.runNPMInstall(OUT_DIR);

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'node_modules/**/*',
        '.expo/*',
        'npm-debug.*',
        '*.jks',
        '*.p12',
        '*.key',
        '*.mobileprovision*/'
    ]);

    // README
    this.tools.copyREADME(
        TEMPLATES_DIR, OUT_DIR, {
            title: NAME_AND_TITLE.title,
        }
    );

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR);
}
