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
 * A test generator.
 */
exports.run = async function() {
    const TEST = await this.prompt([{
        type    : 'list',
        name    : 'selected_generator2',
        message : 'Please select a 2nd generator:',
        choices: [{
            name: "Test2",
            value: 'testxyz'
        }]
    }]);

    console.log(TEST['selected_generator2']);
};
