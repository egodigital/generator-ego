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

const chalk = require('chalk');
const fs = require('fs');
const gen_api_electron_mdbootstrap = require('./gen/app-electron-mdbootstrap');
const gen_api_node_express = require('./gen/api-node-express');
const gen_api_php_slim = require('./gen/api-php-slim');
const gen_html5 = require('./gen/html5');
const Generator = require('yeoman-generator');
const os = require('os');
const path = require('path');
const tools = require('./tools');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.tools = new tools(this);
    }

    async prompting() {
        const PACKAGE_JSON = JSON.parse(
            fs.readFileSync(__dirname + '/../../package.json', 'utf8')
        );

        process.stdout.write(
            `${chalk.white('generator-ego ' + PACKAGE_JSON.version)}${os.EOL}`
        );
        process.stdout.write(
            `${chalk.blue('e') + chalk.grey('.') + chalk.blue('GO') + chalk.grey(' Digital GmbH <') + chalk.white('hello@e-go-digital.com') + chalk.grey('>')}${os.EOL}`
        );
        process.stdout.write(
            `${chalk.white(PACKAGE_JSON.description)}${os.EOL}`
        );
        process.stdout.write(
            `${os.EOL}`
        );

        // build-in generators
        const BUILDIN_CHOICES = [{
            name: "🛠  API (Node - Express ^4.0)",
            value: gen_api_node_express.run,
        }, {
            name: "🛠  API (PHP - Slim ^3.0)",
            value: gen_api_php_slim.run,
        }, {
            name: "🖥  App (Electron - MD Bootstrap)",
            value: gen_api_electron_mdbootstrap.run,
        }, {
            name: "🌐  HTML 5",
            value: gen_html5.run,
        }];

        const CUSTOM_GENERATORS_FILE = path.resolve(
            path.join(
                os.homedir(), 'yo-ego.js'
            )
        );

        // check for custom / additional generatoras
        // in 'yo-ego.js' file in home directory
        const CUSTOM_CHOISES = [];
        if (fs.existsSync(CUSTOM_GENERATORS_FILE)) {
            const STATS = fs.lstatSync(CUSTOM_GENERATORS_FILE);
            if (STATS.isFile()) {
                const CUSTOM_GENERATORS_SCRIPT = loadScriptFromHome(CUSTOM_GENERATORS_FILE)['module'];
                if (CUSTOM_GENERATORS_SCRIPT) {
                    const GENERATORS = CUSTOM_GENERATORS_SCRIPT.generators;
                    if (GENERATORS) {
                        for (const OPTION in GENERATORS) {
                            const NAME = `🧩  ${OPTION}`;

                            const GENERATOR_FUNC = GENERATORS[OPTION];
                            if ('function' === typeof GENERATOR_FUNC) {
                                CUSTOM_CHOISES.push({
                                    name: `${NAME} (${chalk.yellow(path.basename(CUSTOM_GENERATORS_FILE))})`,
                                    value: GENERATOR_FUNC,
                                });
                            } else {
                                // path to a script

                                ((scriptFile, optionName) => {
                                    const SCRIPT = loadScriptFromHome(scriptFile);

                                    let relativePath = path.relative(
                                        path.dirname(CUSTOM_GENERATORS_FILE),
                                        SCRIPT.file,
                                    );
                                    if ('../..' === relativePath) {
                                        relativePath = SCRIPT.file;
                                    }

                                    CUSTOM_CHOISES.push({
                                        name: `${optionName} (${chalk.yellow(relativePath)})`,
                                        value: () => {
                                            return SCRIPT['module'].run
                                                                   .apply(this, []);
                                        },
                                    });
                                })(String(GENERATOR_FUNC), NAME);
                            }
                        }
                    }
                }
            }
        }

        this.generators = await this.prompt([{
            type    : 'list',
            name    : 'selected_generator',
            message : 'Please select a generator:',
            choices: CUSTOM_CHOISES.concat(
                BUILDIN_CHOICES
            ),
        }]);
    }

    async writing() {
        if (!this.generators) {
            return;
        }

        const GENERATOR = this.generators['selected_generator'];
        if (!GENERATOR) {
            return;
        }

        return await Promise.resolve(
            GENERATOR.apply(this, [])
        );
    }
};

function loadScriptFromHome(script) {
    if (!path.isAbsolute(script)) {
        script = path.join(
            os.homedir(), script
        );
    }

    script = path.resolve(script);

    delete require.cache[script];
    return {
        'file': script,
        'module': require(script),
    };
}
