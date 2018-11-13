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
const path = require('path');
const sanitizeFilename = require('sanitize-filename');

/**
 * A test generator.
 */
exports.run = async function() {
    const TEMPLATES_DIR = this.templatePath('api-php-slim');

    const NAME = (await this.prompt([{
        type: 'input',
        name: 'api-php-slim_name',
        message: 'Enter the NAME of your project:',
        validate: (val) => {
            return '' !== String(val).trim();
        }
    }]))['api-php-slim_name'].trim();

    let title = (await this.prompt([{
        type: 'input',
        name: 'api-php-slim_title',
        message: "Enter the project's TITLE:",
        default: NAME,
    }]))['api-php-slim_title'].trim();

    if ('' === title) {
        title = NAME;
    }

    const OUT_DIR = path.resolve(
        path.join(
            this.destinationPath(
                sanitizeFilename(NAME)
            ),
        )
    );

    if (fs.existsSync(OUT_DIR)) {
        this.log('[ERROR] Target directory already exists.');
        return;
    }

    fs.mkdirSync(OUT_DIR);
    this.log(`Created target directory '${ path.basename(OUT_DIR) }'.`);

    this.log(`Copying files to '${ path.basename(OUT_DIR) }' ...`);
    this.fs.copy(TEMPLATES_DIR + '/**', OUT_DIR);

    this.log(`Running Composer ...`);
    this.spawnCommandSync('composer', ['require', 'slim/slim', '^3.0'], {
        'cwd': OUT_DIR
    });
};
