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
const HtmlEntities = require('html-entities').AllHtmlEntities;
const path = require('path');

/**
 * A test generator.
 */
exports.run = async function() {
    const HTML = new HtmlEntities();

    const TEMPLATES_DIR = this.templatePath('html5');

    const NAME = (await this.prompt([{
        type: 'input',
        name: 'html5_name',
        message: 'Enter the NAME of your project:',
        validate: (val) => {
            return '' !== String(val).trim();
        }
    }]))['html5_name'].trim();

    let title = (await this.prompt([{
        type: 'input',
        name: 'html5_title',
        message: "Enter the project's TITLE:",
        default: NAME,
    }]))['html5_title'].trim();

    if ('' === title) {
        title = NAME;
    }

    const OUT_DIR = path.resolve(
        path.join(
            this.destinationPath(
                NAME
            ),
        )
    );

    const TITLE = path.basename(OUT_DIR);

    if (fs.existsSync(OUT_DIR)) {
        this.log('[ERROR] Target directory already exists.');
        return;
    }

    fs.mkdirSync(OUT_DIR);
    this.log(`Created target directory '${ path.basename(OUT_DIR) }'.`);

    this.log(`Copying files to '${ path.basename(OUT_DIR) }'.`);
    this.fs.copy(TEMPLATES_DIR + '/**', OUT_DIR);

    this.fs.copyTpl(TEMPLATES_DIR + '/index.html', OUT_DIR + '/index.html', {
        'title': HTML.encode(title),
    });
};
