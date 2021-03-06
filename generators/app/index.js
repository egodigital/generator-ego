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
const fsExtra = require('fs-extra');
const Generator = require('yeoman-generator');
const os = require('os');
const path = require('path');
const Signale = require('signale').Signale;
const tools = require('./tools');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        this.egoose = require('@egodigital/egoose');
        this.logger = new Signale();
        this.tools = new tools(this);
    }

    async prompting() {
        const PACKAGE_JSON = JSON.parse(
            fs.readFileSync(__dirname + '/../../package.json', 'utf8')
        );

        process.stdout.write(
            `${chalk.reset()}`
        );
        process.stdout.write(
            `${chalk.white('generator-ego ' + PACKAGE_JSON.version)}${os.EOL}`
        );
        process.stdout.write(
            `${chalk.reset(PACKAGE_JSON.description)}${os.EOL}`
        );
        process.stdout.write(
            `${os.EOL}`
        );
        process.stdout.write(
            `${chalk.blueBright('e') + chalk.reset('.') + chalk.blueBright('GO') + chalk.reset(' Digital GmbH <') + chalk.white('https://e-go-digital.com') + chalk.reset('>')}${os.EOL}`
        );

        process.stdout.write(
            `${os.EOL}${chalk.reset()}`
        );

        // build-in generators
        const BUILDIN_CHOICES = [];
        {
            const GEN_DIR = path.resolve(
                path.join(__dirname, 'gen')
            );

            for (const ITEM of await fsExtra.readdir(GEN_DIR)) {
                if (!ITEM.endsWith('.js')) {
                    continue;
                }

                const GENERATOR_FILE = require.resolve(
                    path.join(GEN_DIR, ITEM)
                );

                const GENERATOR_MODULE = require(
                    GENERATOR_FILE
                );

                let icon;
                let displayName;

                const ABOUT = GENERATOR_MODULE.about;
                if (ABOUT) {
                    displayName = ABOUT.displayName;
                    icon = ABOUT.icon;
                }

                icon = this.tools
                    .toStringSafe(icon)
                    .trim();

                displayName = this.tools
                    .toStringSafe(displayName)
                    .trim();
                if ('' === displayName) {
                    displayName = path.basename(GENERATOR_FILE);
                }

                BUILDIN_CHOICES.push({
                    name: `${'' !== icon ? (icon + '  ') : ''}${displayName}`,
                    value: GENERATOR_MODULE.run,
                    sortBy: displayName.toLowerCase(),
                });
            }
        }

        const CUSTOM_GENERATORS_FILE = path.resolve(
            path.join(
                os.homedir(), 'yo-ego.js'
            )
        );

        // check for custom / additional generatoras
        // in 'yo-ego.js' file in home directory
        const CUSTOM_CHOISES = [];
        if (fs.existsSync(CUSTOM_GENERATORS_FILE)) {
            const STATS = fs.statSync(CUSTOM_GENERATORS_FILE);
            if (STATS.isFile()) {
                const CUSTOM_GENERATORS_SCRIPT = loadScriptFromHome(CUSTOM_GENERATORS_FILE)['module'];
                if (CUSTOM_GENERATORS_SCRIPT) {
                    const GENERATORS = CUSTOM_GENERATORS_SCRIPT.generators;
                    if (GENERATORS) {
                        for (const OPTION in GENERATORS) {
                            const NAME = `🔌  ${OPTION}`;

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
                                })(this.tools.toStringSafe(GENERATOR_FUNC), NAME);
                            }
                        }
                    }
                }
            }
        }

        this.generators = await this.prompt([{
            type: 'list',
            name: 'ego_selected_generator',
            message: 'Please select a generator:',
            choices: CUSTOM_CHOISES.concat(
                BUILDIN_CHOICES.sort((x, y) => {
                    return this.tools
                        .compareValuesBy(x, y,
                            bc => bc.sortBy);
                }),
            ),
        }]);
    }

    async writing() {
        if (!this.generators) {
            return;
        }

        const GENERATOR = this.generators['ego_selected_generator'];
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
