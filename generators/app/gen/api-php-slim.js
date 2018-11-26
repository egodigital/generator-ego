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

/**
 * A generator for PHP based APIs (Slim).
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('api-php-slim');

    const NAME_AND_TITLE = await this.tools
        .askForNameAndTitle();
    if (!NAME_AND_TITLE) {
        return;
    }

    const OUT_DIR = NAME_AND_TITLE.mkDestinationDir();

    // copy all files
    this.tools
        .copyAll(TEMPLATES_DIR, OUT_DIR);

    // .gitignore
    this.tools.createGitIgnore(OUT_DIR, [
        'vendor/'
    ]);

    // Composer
    this.log(`Running Composer ...`);
    this.spawnCommandSync('composer', ['require', 'slim/slim', '^3.0'], {
        'cwd': OUT_DIR
    });

    await this.tools
        .askForGitInit(OUT_DIR);

    await this.tools
        .askForOpenVSCode(OUT_DIR);
};
