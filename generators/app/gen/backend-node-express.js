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

// information about that generator
exports.about = {
    displayName: 'Backend (Node - Express & React)',
    icon: '🛠',
};

/**
 * A generator for Node.js based APIs (Express).
 */
exports.run = async function () {
    const templateDir = this.templatePath('backend-node-express');

    const projectName = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the NAME of your project:`, {
            validator: true,
        }
        )
    ).trim();
    if (!projectName.length) {
        return;
    }

    const projectNameLower = projectName.toLowerCase();

    // create output directory
    const outDir = this.tools
        .mkDestinationDir(projectNameLower);

    const filesToOpenInVSCode = [];

    await this.tools.withSpinner('Copying files', async (spinner) => {
        this.fs.copy(templateDir,outDir);
    });

    await this.tools
        .askForGitInit(outDir);

    await this.tools.askForOpenVSCode(
        outDir,
        filesToOpenInVSCode,
    );
};
