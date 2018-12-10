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

const _ = require('lodash');
const ejs = require('ejs');
const fs = require('fs');
const fsExtra = require('fs-extra');
const htmlEntities = require('html-entities').AllHtmlEntities;
const got = require('got');
const minimatch = require('minimatch');
const ora = require('ora');
const os = require('os');
const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const signale = require('signale');
const xmlJS = require('xml-js');
const zip = require('node-zip');

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
     * Keeps sure a value is an array.
     * 
     * @param {any} val The input value.
     * @param {Boolean} [noEmpty] Remove items, which are (null) or (undefined). Default: (true)
     * 
     * @return {Array} The output value.
     */
    asArray(val, noEmpty) {
        if (arguments.length < 2) {
            noEmpty = true;
        }

        if (!Array.isArray(val)) {
            val = [ val ];
        }

        return val.filter(x => {
            if (noEmpty) {
                return !_.isNil(x);
            }

            return true;
        });
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
            default: true
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
     * Compares two values.
     *
     * @param {any} x The left value.
     * @param {any} y The right value.
     * 
     * @return {Number} 0 => both are equal; 1 => x > y; -1 => x < y
     */
    compareValues(x, y) {
        return this.compareValuesBy(x, y,
            i => i);
    }

    /**
     * Compares two values by using a selector.
     *
     * @param {any} x The left value.
     * @param {any} y The right value.
     * @param {Function} selector The function that selects the values for x and y to compare.
     * 
     * @return {Number} 0 => both are equal; 1 => x > y; -1 => x < y
     */
    compareValuesBy(x, y, selector) {
        const VAL_X = selector(x);
        const VAL_Y = selector(y);

        if (VAL_X !== VAL_Y) {
            if (VAL_X < VAL_Y) {
                return -1;
            }

            if (VAL_X > VAL_Y) {
                return 1;
            }
        }

        return 0;
    }

    /**
     * Copies files from one destination to another by using patterns.
     *
     * @param {String} from The source directory.
     * @param {String} to The target directory.
     * @param {String|Array} [patterns] The (minimatch) patters, that describes, what elements to use. Default: '**'
     * @param {String|Array} [excludes] The (minimatch) patters, that describes, what elements to exclude.
     */
    copy(from, to, patterns, excludes) {
        this.log(`Copying files to '${ to }' ...`);

        this.copyInner(from, to, {
            'excludes': excludes,
            'path': '/',
            'patterns': patterns,
        });
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

    copyInner(from, to, opts) {
        from = path.resolve(
            from
        );
        to = path.resolve(
            to
        );

        const INCLUDE_PATTERNS = this.asArray(opts.patterns)
            .map(p => String(p))
            .filter(p => '' !== p.trim());
        if (INCLUDE_PATTERNS.length < 1) {
            INCLUDE_PATTERNS.push('**');
        }

        for (const ITEM of fsExtra.readdirSync(from)) {
            const FROM_ITEM = path.resolve(
                path.join(
                    from, ITEM
                )
            );

            const STAT = fsExtra.statSync(FROM_ITEM);

            // with and without beginning slashed
            const FROM_ITEMS_RELATIVE = [
                opts.path + ITEM
            ];
            FROM_ITEMS_RELATIVE.push(
                FROM_ITEMS_RELATIVE[0].substr(1)
            );
            if (STAT.isDirectory()) {
                // add expressions with ending slash

                FROM_ITEMS_RELATIVE.push(
                    FROM_ITEMS_RELATIVE[0] + '/'
                );
                FROM_ITEMS_RELATIVE.push(
                    FROM_ITEMS_RELATIVE[1].substr(1) + '/'
                );
            }

            const TO_ITEM = path.resolve(
                path.join(
                    to, ITEM
                )
            );

            if (STAT.isDirectory()) {
                this.copyInner(FROM_ITEM, TO_ITEM, {
                    'excludes': opts.excludes,
                    'path': opts.path + ITEM + '/',
                    'patterns': opts.patterns,
                });
            } else {
                if (!FROM_ITEMS_RELATIVE.some(x => this.doesMatch(x, opts.excludes))) {
                    // not excluded
                    if (FROM_ITEMS_RELATIVE.some(x => this.doesMatch(x, INCLUDE_PATTERNS))) {
                        // included

                        // keep sure the target directory exists
                        const TARGET_DIR = path.dirname(
                            TO_ITEM
                        );
                        if (!fsExtra.existsSync(TARGET_DIR)) {
                            fsExtra.mkdirsSync(TARGET_DIR);
                        }

                        fsExtra.copySync(FROM_ITEM, TO_ITEM);
                    }
                }
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
     * Checks if a value matches a (minimatch) pattern.
     *
     * @param {any} val The input value.
     * @param {String|Array} patterns One or more patterns.
     */
    doesMatch(val, patterns) {
        val = String(val);

        return this.asArray(patterns)
            .map(p => String(p))
            .filter(p => '' !== p.trim())
            .some(p => minimatch(val, p));
    }

    /**
     * Downloads a file.
     *
     * @param {String} url The URL of the file.
     * 
     * @return {Buffer} The downloaded data.
     */
    async download(url) {
        url = String(url);

        this.log(`Downloading file '${ url }' ...`);
        const RESPONSE = await got(url);

        if (RESPONSE.statusCode >= 400 && RESPONSE.statusCode < 500) {
            throw new Error(`Client error: [${ RESPONSE.statusCode }] '${ RESPONSE.statusMessage }'`);
        }

        if (RESPONSE.statusCode >= 500 && RESPONSE.statusCode < 600) {
            throw new Error(`Server error: [${ RESPONSE.statusCode }] '${ RESPONSE.statusMessage }'`);
        }

        if (RESPONSE.statusCode >= 600) {
            throw new Error(`Unknown error: [${ RESPONSE.statusCode }] '${ RESPONSE.statusMessage }'`);
        }

        if (204 == RESPONSE.statusCode) {
            return Buffer.alloc(0);
        }

        if (200 != RESPONSE.statusCode) {
            throw new Error(`Unexpected response: [${ RESPONSE.statusCode }] '${ RESPONSE.statusMessage }'`);
        }

        return RESPONSE.body;
    }

    /**
     * Downloads a Git repository to a destination.
     *
     * @param {String} repo The (source of the) repository.
     * @param {String} dest The destination folder.
     * @param {Object} [opts] Custom options.
     */
    async downloadGitRepo(repo, dest, opts) {
        const ME = this;

        if (arguments.length < 3) {
            opts = {};
        }

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
                            .apply(ME.generator, [{
                                dir: dest,
                                'event': 'downloaded',
                                generator: ME.generator,
                                repository: repo,
                                tag: opts.tag
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
     * Creates an object from XML data.
     *
     * @param {String|Buffer} xml The raw XML data.
     * @param {Boolean} [compact] Returns compact data or not. Default: (false)
     * 
     * @return {Object} The XML object.
     */
    fromXml(xml, compact) {
        if (arguments.length < 2) {
            compact = false;
        }

        if (Buffer.isBuffer(xml)) {
            xml = xml.toString('utf8');
        } else {
            xml = String(xml);
        }

        return JSON.parse(
            xmlJS.xml2json(xml, {
                compact: compact,
                spaces: 2,
            })
        );
    }

    /**
     * Checks if current user has SSH keys stored inside its home directory.
     * 
     * @return {Boolean} Has SSH keys or not.
     */
    hasSSHKeys() {
        const PRIV_KEY = path.join(
            os.homedir(), '.ssh/id_rsa'
        );
        const PUB_KEY = path.join(
            os.homedir(), '.ssh/id_rsa.pub'
        );

        return this.isFile(PRIV_KEY) &&
            this.isFile(PUB_KEY);
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
                this.toStringSafe(arguments[i])
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
     * Checks if a path exists and is a directory.
     *
     * @param {String} path The path to check.
     * 
     * @return {Boolean} Path does exist and is a directory or not.
     */
    isDir(path) {
        return this.isExistingFileSystemItem(
            path, s => s.isDirectory()
        );
    }

    isExistingFileSystemItem(path, statSelector) {
        path = this.toStringSafe(path);

        if (fsExtra.existsSync(path)) {
            return statSelector(
                fsExtra.statSync(path)
            );
        }

        return false;
    }

    /**
     * Checks if a path exists and is a file.
     *
     * @param {String} path The path to check.
     * 
     * @return {Boolean} Path does exist and is a file or not.
     */
    isFile(path) {
        return this.isExistingFileSystemItem(
            path, s => s.isFile()
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
     * Invokes a function for log interactivly.
     *
     * @param {String} scope The scope.
     * @param {Function} func The function to invoke.
     *                        The underlying, interactive Signale logger is submitted to that functions as first argument.
     * 
     * @return {Promise} The promise with the result of the function.
     */
    async logInteractive(scope, func) {
        const INTERACTIVE_LOGGER = new signale.Signale({
            interactive: true
        });

        INTERACTIVE_LOGGER.scope(this.toStringSafe(scope));
        try {
            return await Promise.resolve(
                func.apply(this.generator,
                           [ INTERACTIVE_LOGGER ])
            );
        } finally {
            INTERACTIVE_LOGGER.unscope();

            process.stdout.write(
                os.EOL
            );
        }
    }

    /**
     * Invokes a function for log interactivly (synchronously).
     *
     * @param {String} scope The scope.
     * @param {Function} func The function to invoke.
     *                        The underlying, interactive Signale logger is submitted to that functions as first argument.
     * 
     * @return {any} The result of the function.
     */
    logInteractiveSync(scope, func) {
        const INTERACTIVE_LOGGER = new signale.Signale({
            interactive: true
        });

        INTERACTIVE_LOGGER.scope(this.toStringSafe(scope));
        try {
            return func.apply(this.generator,
                              [ INTERACTIVE_LOGGER ]);
        } finally {
            INTERACTIVE_LOGGER.unscope();

            process.stdout.write(
                os.EOL
            );
        }
    }

    /**
     * Creates a folder inside the destination path.
     *
     * @param {String} name The name of the target folder.
     * @param {Boolean} [throwIfExist] Throw an exception if folder already exists or not. Default: true
     * 
     * @return {String} The path of the created folder.
     */
    mkDestinationDir(name, throwIfExist) {
        const DEST_DIR = path.resolve(
            path.join(
                this.generator.destinationPath(
                    sanitizeFilename(
                        String(name).trim()
                    )
                ),
            )
        );

        if (throwIfExist) {
            if (fs.existsSync(DEST_DIR)) {
                throw new Error('[ERROR] Destination directory already exists!');
            }
        }

        fs.mkdirSync(DEST_DIR);
        this.log(`Created destination directory '${ DEST_DIR }'.`);

        return DEST_DIR;
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
     * Prompts for an item of a (string) list.
     *
     * @param {String} message The message,
     * @param {Array} list The list of items.
     * @param {Object} [opts] Custom options.
     * 
     * @return {Promise<String>} The promise with the selected item.
     */
    async promptList(message, list, opts) {
        if (arguments.length < 3) {
            opts = {};
        }

        return (await this.prompt([{
            'type': 'list',
            'name': 'ego_item',
            'message': this.toStringSafe(message),
            'choices': this.asArray(list),
            'default': opts.default,
        }]))['ego_item'];
    }

    /**
     * Prompt for selecting items.
     *
     * @param {String} message The message.
     * @param {Object} items The items, which can be selected.
     * 
     * @return {Promise<Array>} The promise with the array of selected values.
     */
    async promptMultiSelect(message, items) {
        return (await this.prompt([{
            'type': 'checkbox',
            'name': 'ego_checked_items',
            'message': this.toStringSafe(message),
            'choices': items,
        }]))['ego_checked_items'];
    }

    /**
     * Prompts for a string.
     *
     * @param {String} message The message,
     * @param {Object} [opts] Custom options.
     * 
     * @return {Promise<string>} The promise with the input value.
     */
    async promptString(message, opts) {
        if (arguments.length < 2) {
            opts = {};
        }

        let validator = opts.validator;
        if (validator) {
            if (true === validator) {
                validator = (val) => {
                    return '' !== this.toStringSafe(val)
                        .trim();
                };
            }
        }

        let defaultValue = this.toStringSafe(opts.default);

        const PROMPT_OPTS = {
            type: 'input',
            name: 'ego_value',
            message: this.toStringSafe(message),
            validate: validator
        };

        if ('' !== defaultValue) {
            PROMPT_OPTS.default = defaultValue;
        }

        return (await this.prompt([
            PROMPT_OPTS
        ]))['ego_value'];
    }

    /**
     * Opens a module in generator's context.
     *
     * @param {String} id The ID/path of the module.
     * 
     * @return {Object} The module.
     */
    require(id) {
        return require(id);
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

    /**
     * A promise version of 'setTimeout()' function.
     *
     * @param {Number} ms The time to wait, in milliseconds.
     */
    sleep(ms) {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve();
                }, ms);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Creates a clone of an object and sort its keys.
     *
     * @param {any} obj The object.
     * @param {Function} [keyComparer] The custom key comparer.
     * 
     * @return {any} The cloned object.
     */
    sortObjectByKey(obj, keyComparer) {
        if (arguments.length < 2) {
            keyComparer = (key) => {
                return this.toStringSafe(key)
                    .toLowerCase()
                    .trim();
            };
        }

        if (!obj) {
            return obj;
        }

        // extract keys and sort them
        const KEYS = Object.keys(
            obj
        ).sort((x, y) => {
            return this.compareValuesBy(x, y,
                keyComparer);
        });

        // create new object
        const NEW_OBJ = {};
        for (const K of KEYS) {
            NEW_OBJ[K] = obj[K];
        }

        return NEW_OBJ;
    }

    /**
     * Converts a value to a string.
     *
     * @param {any} val The input value.
     * @param {String} [defaultValue] The custom default value. Default: ''
     * 
     * @return {String} The output value.
     */
    toStringSafe(val, defaultValue) {
        if (arguments.length < 2) {
            defaultValue = '';
        }

        if (_.isString(val)) {
            return val;
        }

        if (_.isNil(val)) {
            return String(defaultValue);
        }

        try {
            if (val instanceof Error) {
                return `[${ val.name }] ${ val.message }

${ val.stack }`;
            }
    
            if (_.isFunction(val['toString'])) {
                return String(val.toString());
            }
    
            if (_.isObject(val)) {
                return JSON.stringify(val);
            }
        } catch (e) { }

        return String(val);
    }

    /**
     * Creates a XML string from an object (as opened with 'fromXml()' function).
     *
     * @param {Object} obj The XML as (JSON) object.
     * @param {Number} [spaces] The number of spaces for a tab. Default: 4
     * 
     * @return {String} The XML string.
     */
    toXml(obj, spaces) {
        if (arguments.length < 2) {
            spaces = 4;
        }

        return xmlJS.json2xml(obj, {
            compact: false,
            spaces: spaces,
        });
    }

    /**
     * Unzips a file/container.
     * 
     * @param {String|Buffer} file The path to the file or its content.
     * 
     * @return {Object} The object that represents the ZIP container.
     */
    unzip(file) {
        if (!Buffer.isBuffer(file)) {
            file = fsExtra.readFileSync(String(file));
        }

        return zip(file, {
            base64: false,
        });
    }

    /**
     * Invokes an action for a spinner (text).
     *
     * @param {String|Object} textOrOptions The initial text or options.
     * @param {Function} func The function to invoke.
     * 
     * @return {Promise} The promise with the result of the function.
     */
    async withSpinner(textOrOptions, func) {
        const SPINNER = new ora(textOrOptions);

        SPINNER.start();
        try {
            return await Promise.resolve(
                func(SPINNER)
            );
        } finally {
            SPINNER.stop();
        }
    }

    /**
     * Invokes an action for a spinner (text) synchronously.
     *
     * @param {String|Object} textOrOptions The initial text or options.
     * @param {Function} func The function to invoke.
     * 
     * @return {any} The result of the function.
     */
    withSpinnerSync(textOrOptions, func) {
        const SPINNER = new ora(textOrOptions);

        SPINNER.start();
        try {
            return func(SPINNER);
        } finally {
            SPINNER.stop();
        }
    }
}
