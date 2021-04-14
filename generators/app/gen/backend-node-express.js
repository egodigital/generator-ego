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

const optionMongo = 'Mongo';
const optionRedis = 'Redis';
const optionTypeORM = 'TypeORM';

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

    const selectedFeatures = await this.tools.promptMultiSelect(
        'What features do you like to use?',
        [{
            name: optionMongo,
            checked: false
        }, {
            name: optionRedis,
            checked: true
        }, {
            name: optionTypeORM,
            checked: true
        }]
    );

    const options = {
        mongo: selectedFeatures.includes(optionMongo),
        name: sanitizeFilename(projectName.toLowerCase()),
        redis: selectedFeatures.includes(optionRedis),
        typeORM: selectedFeatures.includes(optionTypeORM),
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

                if (!options.redis) {
                    delete packageJSON.dependencies['redis'];

                    delete packageJSON.devDependencies['@types/redis'];
                }

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

            if (options.redis) {
                backendDependsOn.push('redis');
            } else {
                delete dockerCompose.services.redis;
            }

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

    await this.tools.withSpinner('Cleanups', async (_spinner) => {
        const dockerFileStartCommands = [
            '/etc/init.d/sshd restart',
            'cd /usr/src/app/backend',
            'npm start'
        ];

        if (options.redis) {
            dockerFileStartCommands.splice(1, 0, '/etc/init.d/redis restart');
        } else {
            await deleteFile('backend/src/cache.ts');

            await editFile('Dockerfile', async (Dockerfile) => {
                let lines = Dockerfile.split('\n');
                lines = lines.filter(l => {
                    return !l.includes('apk add redis') &&
                        !l.includes('rc-update add redis');
                });

                return lines.join('\n');
            });
        }

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

        // update Dockerfile
        await editFile('Dockerfile', async (Dockerfile) => {
            let lines = Dockerfile.split('\n').map(l => {
                if (l.trim().startsWith('CMD ')) {
                    l = `CMD sh -c "${dockerFileStartCommands.join(' && ')}"`;
                }

                return l;
            });

            return lines.join('\n');
        });

        // update backend/.env
        await editFile('backend/.env', async (envFile) => {
            return envFile.split('\n').filter(l => {
                if (l.trim().length) {
                    if (!options.redis) {
                        if (l.trim().startsWith('REDIS_')) {
                            return false;
                        }
                    }

                    if (!options.typeORM) {
                        if (l.trim().startsWith('DB_')) {
                            return false;
                        }
                    }

                    if (!options.mongo) {
                        if (l.trim().startsWith('MONGO_')) {
                            return false;
                        }
                    }

                    return true;
                }

                return false;
            }).join('\n');
        });
    });

    // README.md
    this.tools.copyREADME(
        templateDir, outDir, {
            name_internal: options.name,
            title: projectName,
        }
    );

    // npm install
    await this.tools.withSpinner(`Run 'npm install'`, async (_spinner) => {
        const nodeDirs = [
            outDir,
            path.join(outDir, 'backend'),
            path.join(outDir, 'frontend')
        ];

        for (const dir of nodeDirs) {
            this.tools.runNPMInstall(dir);
        }
    });

    await this.tools
        .askForGitInit(outDir);

    await this.tools.askForOpenVSCode(
        outDir,
        filesToOpenInVSCode,
    );
};
