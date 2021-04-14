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
const fsExtra = require('fs-extra');
const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const yaml = require('js-yaml');

// information about that generator
exports.about = {
    displayName: 'Backend (Node - Express & React)',
    icon: '🛠',
};

const optionDatabaseMongo = 'Mongo';
const optionDatabaseTypeORM = 'TypeORM';

/**
 * A generator for Node.js based APIs (Express).
 */
exports.run = async function () {
    const templateDir = this.templatePath('backend-node-express');

    const projectName = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the NAME of your project:`, {
            validator: true,
        })
    ).trim();
    if (!projectName.length) {
        return;
    }

    const databases = await this.tools.promptMultiSelect(
        'Select the databases, the backend supports:',
        [{
            name: optionDatabaseTypeORM,
            checked: true
        }, {
            name: optionDatabaseMongo,
            checked: false
        }]
    );

    const options = {
        mongo: databases.includes(optionDatabaseMongo),
        name: sanitizeFilename(projectName.toLowerCase()),
        typeORM: databases.includes(optionDatabaseTypeORM),
    };

    // create output directory
    const outDir = this.tools
        .mkDestinationDir(options.name);

    const deleteFile = async (relPath) => {
        const file = path.join(outDir, relPath);

        await fs.promises.unlink(file);
    };

    const deleteFolder = async (relPath) => {
        const folder = path.join(outDir, relPath);

        await fsExtra.remove(folder);
    };

    const editFile = async (relPath, action) => {
        const file = path.join(outDir, relPath);

        const newText = await action(
            await fs.promises.readFile(file, 'utf8')
        );

        await fs.promises.writeFile(file, newText, 'utf8');
    };

    const editJSON = async (relPath, action) => {
        const file = path.join(outDir, relPath);

        const obj = JSON.parse(
            await fs.promises.readFile(file, 'utf8')
        );

        await action(obj);

        await fs.promises.writeFile(file, JSON.stringify(obj, null, 4), 'utf8');
    };

    const editYAML = async (relPath, action) => {
        const file = path.join(outDir, relPath);

        const obj = yaml.load(
            await fs.promises.readFile(file, 'utf8')
        );

        await action(obj);

        await fs.promises.writeFile(file, yaml.dump(obj, null, 4), 'utf8');
    };

    const filesToOpenInVSCode = [];

    // copy files
    await this.tools.withSpinner('Copying files', async (spinner) => {
        const filesToExclude = [];

        this.tools.copy(templateDir, outDir, null, filesToExclude);
    });

    // update package.json files
    await this.tools.withSpinner('Update package.json files', async (spinner) => {
        const packageJSONFiles = {
            'package.json': async (packageJSON) => {
                packageJSON.name = `${options.name}`;
            },
            'backend/package.json': async (packageJSON) => {
                packageJSON.name = `${options.name}-backend`;

                if (options.typeORM) {
                    packageJSON.scripts['dev'] = "ts-node ./node_modules/typeorm/cli.js migration:run && nodemon --watch 'src/**/*.ts' --watch 'src/res/**/*' --ignore 'src/**/*.spec.ts' --exec node -r ts-node/register --inspect=0.0.0.0:9229 src/index.ts";
                } else {
                    packageJSON.scripts['dev'] = "nodemon --watch 'src/**/*.ts' --watch 'src/res/**/*' --ignore 'src/**/*.spec.ts' --exec node -r ts-node/register --inspect=0.0.0.0:9229 src/index.ts";

                    delete packageJSON.dependencies['typeorm'];
                    delete packageJSON.dependencies['pq'];

                    delete packageJSON.devDependencies['@types/pg'];

                    delete packageJSON.scripts['migration:create'];
                }

                if (!options.mongo) {
                    delete packageJSON.dependencies['mongoose'];
                    delete packageJSON.devDependencies['@types/mongoose'];
                }
            },
            'frontend/package.json': async (packageJSON) => {
                packageJSON.name = `${options.name}-frontend`;
            },
        };

        for (const file in packageJSONFiles) {
            await editJSON(file, packageJSONFiles[file]);
        }
    });

    // update docker-compose.yml
    await this.tools.withSpinner('Update docker-compose.yml', async (spinner) => {
        await editYAML('docker-compose.yml', (dockerCompose) => {
            const backendDependsOn = [];

            if (options.mongo) {
                backendDependsOn.push('mongo');
            } else {
                delete dockerCompose.services.mongo;
            }

            if (options.typeORM) {
                backendDependsOn.push('postgres');
            } else {
                delete dockerCompose.services.postgres;
            }

            if (backendDependsOn.length) {
                dockerCompose.services.backend.depends_on = backendDependsOn;
            } else {
                delete dockerCompose.services.backend.depends_on;
            }
        });
    });

    await this.tools.withSpinner('Cleanups', async (spinner) => {
        if (!options.typeORM) {
            await deleteFile('backend/ormconfig.js');
            await deleteFile('backend/src/database/typeorm.ts');

            await deleteFolder('backend/src/database/entity');
            await deleteFolder('backend/src/database/migration');
        }

        if (!options.mongo) {
            await deleteFile('backend/src/database/mongo.ts');
        }

        const databaseIndexExports = [];
        if (options.mongo) {
            databaseIndexExports.push("export * from './mongo';");
        }
        if (options.typeORM) {
            databaseIndexExports.push("export * from './typeorm';");
        }

        if (databaseIndexExports.length) {
            await editFile('backend/src/database/index.ts', async () => {
                return databaseIndexExports.join('\n');
            });
        } else {
            await deleteFolder('backend/src/database');
        }
    });

    // README.md
    this.tools.copyREADME(
        templateDir, outDir, {
            name_internal: options.name,
            title: projectName,
        }
    );

    await this.tools
        .askForGitInit(outDir);

    await this.tools.askForOpenVSCode(
        outDir,
        filesToOpenInVSCode,
    );
};
