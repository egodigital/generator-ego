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
const gen_test = require('./gen/test');
const Generator = require('yeoman-generator');
const os = require('os');
const path = require('path');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
    }

    async prompting() {
        // build-in generators
        const BUILDIN_CHOICES = [{
            name: "🧰  Test",
            value: gen_test.run,
        }];

        const CUSTOM_GENERATORS_FILE = path.resolve(
            path.join(
                os.homedir(), 'yo.js'
            )
        );

        // check for custom / additional generatoras
        // in 'yo.js' file in home directory
        const CUSTOM_CHOISES = [];
        if (fs.existsSync(CUSTOM_GENERATORS_FILE)) {
            const STATS = fs.lstatSync(CUSTOM_GENERATORS_FILE);
            if (STATS.isFile()) {
                const CUSTOM_GENERATORS_SCRIPT = loadScriptFromHome(CUSTOM_GENERATORS_FILE);
                if (CUSTOM_GENERATORS_SCRIPT) {
                    const GENERATORS = CUSTOM_GENERATORS_SCRIPT.generators;
                    if (GENERATORS) {
                        for (const OPTION in GENERATORS) {
                            const GENERATOR_FUNC = GENERATORS[OPTION];
                            if ('function' === typeof GENERATOR_FUNC) {
                                CUSTOM_CHOISES.push({
                                    name: `🧩  ${OPTION}`,
                                    value: GENERATOR_FUNC,
                                });
                            } else {
                                // path to a script

                                ((scriptFile) => {
                                    CUSTOM_CHOISES.push({
                                        name: `🧩  ${OPTION}`,
                                        value: () => {
                                            return loadScriptFromHome(scriptFile).run
                                                                                 .apply(this, []);
                                        },
                                    });
                                })(String(GENERATOR_FUNC));
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
    return require(script);
}
