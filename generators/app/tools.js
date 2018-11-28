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

const ejs = require('ejs');
const fs = require('fs');
const fsExtra = require('fs-extra');
const htmlEntities = require('html-entities').AllHtmlEntities;
const os = require('os');
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
     * Asks for opening Visual Studio Code for a specific directory.
     *
     * @param {string} dir The directory (or file) to open.
     * @param {Array} [files] One or more additional file to open.
     */
    async askForOpenVSCode(dir, files) {
        const OPEN_VSCODE = (await this.generator.prompt([{
            type: 'confirm',
            name: 'ego_confirm',
            message: 'Open Visual Studio Code?',
            default: true,
        }]))['ego_confirm'];

        if (!files) {
            files = [];
        }

        if (OPEN_VSCODE) {
            this.generator
                .spawnCommand('code', [ dir ].concat(files));

            return true;
        }

        return false;
    }

    /**
     * Copies all files from a source directory to a destination.
     *
     * @param {string} from The source directory.
     * @param {string} to The target directory.
     */
    copyAll(from, to) {
        this.log(`Copying files to '${ to }' ...`);

        this.copyAllInner(from, to);
    }

    copyAllInner(from, to) {
        from = path.resolve(
            from
        );
        to = path.resolve(
            to
        );

        if (!fsExtra.existsSync(to)) {
            fsExtra.mkdirSync(to);
        }

        for (const ITEM of fsExtra.readdirSync(from)) {
            const FROM_ITEM = path.resolve(
                path.join(
                    from, ITEM
                )
            );
            const TO_ITEM = path.resolve(
                path.join(
                    to, ITEM
                )
            );

            const STAT = fsExtra.statSync(FROM_ITEM);
            if (STAT.isDirectory()) {
                this.copyAllInner(FROM_ITEM, TO_ITEM);
            } else {
                fsExtra.copySync(FROM_ITEM, TO_ITEM);
            }
        }
    }

    /**
     * Copies a rendered README.md file to a destination.
     *
     * @param {string} from The source directory.
     * @param {string} to The destination directory.
     * @param {any} [data] Data for rendering.
     */
    copyREADME(from, to, data) {
        this.log(`Setting up 'README.md' ...`);

        const CONTENT = fs.readFileSync(
            from + '/README.md',
            'utf8'
        );

        fs.writeFileSync(
            to + '/README.md',
            ejs.render(CONTENT, data),
            'utf8'
        );
    }

    /**
     * Creates a '.env' file in a specific directory.
     *
     * @param {string} outDir The directory where to create the file to.
     * @param {Object} values Key-value pair of variables. 
     */
    createEnv(outDir, values) {
        this.log(`Creating '.env' ...`);

        const LINES = [];
        for (const KEY in values) {
            LINES.push(
                `${String(KEY).toUpperCase().trim()}=${String(values[KEY])}`
            );
        }
        LINES.push('');

        fs.writeFileSync(
            String(outDir) + '/.env',
            LINES.join("\n"),
            'utf8'
        );
    }

    /**
     * Creates a '.gitignore' file in a specific directory.
     *
     * @param {string} outDir The directory where to create the file to.
     * @param {Array} entries The list of entries for the file. 
     */
    createGitIgnore(outDir, entries) {
        this.log(`Creating '.gitignore' ...`);

        fs.writeFileSync(
            String(outDir) + '/.gitignore',
            entries.join("\n"),
            'utf8'
        );
    }

    /**
     * Downloads a Git repository to a destination.
     *
     * @param {String} repo The (source of the) repository.
     * @param {String} dest The destination folder.
     */
    async downloadGitRepo(repo, dest) {
        repo = String(repo);
        
        dest = path.resolve(
            String(dest)
        );

        const GIT_FOLDER = path.resolve(
            path.join(
                dest, '.git'
            )
        );

        // first clone ...
        this.log(`Downloading Git repo from '${repo}' ...`);
        this.generator.spawnCommandSync('git', ['clone', repo, '.'], {
            'cwd': dest
        });

        // ... then remove '.git' folder
        fsExtra.removeSync(GIT_FOLDER);

        const YO_EGO_FILE = path.resolve(
            path.join(
                dest, '.yo-ego.js'
            )
        );
        if (fs.existsSync(YO_EGO_FILE)) {
            this.log(`Executing Git repo hooks in '${path.basename(YO_EGO_FILE)}' ...`);

            delete require.cache[YO_EGO_FILE];

            const YO_EGO_MODULE = require(YO_EGO_FILE);
            if (YO_EGO_MODULE) {
                if (YO_EGO_MODULE.downloaded) {
                    await Promise.resolve(
                        YO_EGO_MODULE.downloaded
                            .apply(this, [{
                                dir: dest,
                                generator: this,
                                repository: repo,
                            }])
                    );
                }
            }

            fs.unlinkSync(YO_EGO_FILE);
        }
    }

    /**
     * Encodes a string for HTML output.
     *
     * @param {string} str The input string.
     * 
     * @return {string} The encoded string.
     */
    encodeHtml(str) {
        const HTML = new htmlEntities();

        return HTML.encode(
            String(str)
        );
    }

    /**
     * Returns a full, joined path relative to the '.generator-ego'
     * folder, inside the current user's home directory.
     * 
     * @param {string[]} [paths] The paths (parts) to join.
     * 
     * @return {string} The full, joined path.
     */
    homePath() {
        const ARGS = [];
        for (let i = 0; i < arguments.length; i++) {
            ARGS.push(
                String(arguments[i])
            );
        }

        const GENERATOR_DIR = path.resolve(
            path.join(
                os.homedir(), '.generator-ego'
            )
        );

        return path.resolve(
            path.join
                .apply(path, [ GENERATOR_DIR ].concat( ARGS ))
        );
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

    /**
     * Runs 'npm install' inside a directory.
     * 
     * @param {string} dir The directory where to execute the command in.
     */
    runNPMInstall(dir) {
        this.log(`Installing NPM modules ...`);
        this.generator.spawnCommandSync('npm', ['install'], {
            'cwd': dir
        });
    }
}
