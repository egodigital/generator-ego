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
 * Class with tools for the 'tools' property of a generator instance.
 */
module.exports = class {
    /**
     * Initializes a new instance of that class.
     *
     * @param {Object} generator The underlying generator.
     */
    constructor(generator) {
        this.generator = generator;
    }

    /**
     * Asks if a 'git init' should be executed in a specific directory.
     *
     * @param {string} dir The directory where to execute the command in.
     * 
     * @return {Promise<boolean>} The promise that indicates if command has been executed or not.
     */
    async askForGitInit(dir) {
        const DO_GIT_INIT = (await this.generator.prompt([{
            type: 'confirm',
            name: 'ego_confirm',
            message: 'Initialize a Git repository?',
            default: false,
        }]))['ego_confirm'];

        if (DO_GIT_INIT) {
            this.log(`Running 'git init' ...`);

            this.generator.spawnCommandSync('git', ['init'], {
                'cwd': dir
            });

            const GIT_ORIGIN = String(
                (await this.prompt([{
                    type: 'input',
                    name: 'ego_git_origin',
                    message: 'Enter the (optional) URL of your Git remote repository (origin):',
                }]))['ego_git_origin']
            ).trim();

            if ('' !== GIT_ORIGIN) {
                this.generator.spawnCommandSync('git', ['remote', 'add', 'origin', GIT_ORIGIN], {
                    'cwd': dir
                });
            }

            return true;
        }

        return false;
    }

    /**
     * Asks for project name and title.
     * 
     * @return {Object|false} The object with the data or (false) if cancelled.
     */
    async askForNameAndTitle() {
        const ME = this;

        let name = String(
            (await this.prompt([{
                type: 'input',
                name: 'ego_name',
                message: 'Enter the NAME of your project:',
                validate: (val) => {
                    return '' !== String(val).trim();
                }
            }]))['ego_name']
        ).trim();

        if ('' === name) {
            return false;
        }
    
        let title = String(
            (await this.prompt([{
                type: 'input',
                name: 'ego_title',
                message: "Enter the project's TITLE:",
                default: name,
            }]))['ego_title']
        ).trim();
    
        if ('' === title) {
            title = name;
        }

        name = name.toLowerCase();

        return {
            name: name,
            fileName: sanitizeFilename(name),
            getDestinationDir: function(throwIfExist) {
                if (arguments.length < 1) {
                    throwIfExist = true;
                }

                const DEST_DIR = path.resolve(
                    path.join(
                        ME.generator.destinationPath(
                            this.fileName
                        ),
                    )
                );

                if (throwIfExist) {
                    if (fs.existsSync(DEST_DIR)) {
                        throw new Error('[ERROR] Target directory already exists!');
                    }
                }

                return DEST_DIR;
            },
            mkDestinationDir() {
                const DEST_DIR = this.getDestinationDir(true);

                fs.mkdirSync(DEST_DIR);
                ME.log(`Created target directory '${ DEST_DIR }'.`);

                return DEST_DIR;
            },
            title: title,
        };
    }

    /**
     * Copies all files from a source directory to a destination.
     *
     * @param {string} from The source directory.
     * @param {string} to The target directory.
     */
    copyAll(from, to) {
        this.log(`Copying files to '${ to }' ...`);
        this.generator
            .fs
            .copy(from + '/**', to);
    }

    /**
     * Creates a '.gitignore' file in a specific directory.
     *
     * @param {string} outDir The directory where to create the file to.
     * @param {Array} entries The list of entries for the file. 
     */
    createGitIgnore(outDir, entries) {
        this.log(`Creating '.gitignore' ...`);

        this.generator
            .fs
            .write(String(outDir) + '/.gitignore',
                   entries.join("\n"));
    }

    /**
     * Short "path" to 'log()' method of underlying generator.
     * 
     * @return this
     */
    log() {
        this.generator
            .log
            .apply(this.generator, arguments);

        return this;
    }

    /**
     * Short "path" to 'prompt()' method of underlying generator.
     */
    prompt() {
        return this.generator
            .prompt
            .apply(this.generator, arguments);
    }
}
