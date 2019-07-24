# Contribution guidelines

## Implement a generator

### Yeoman

Keep sure to have [Yeoman](https://yeoman.io/) installed (globally):

```bash
npm install -g yo
```

### Get the code

Fork the repository https://github.com/egodigital/generator-ego, clone it

```bash
git clone https://github.com/YOUR-GITHUB-NAME/generator-ego
```

go to the root directory of the project

```bash
cd generator-ego
```

and run the following commands:

```bash
# install required modules
npm install

# make it available as
# global command
# (this may require admin rights, like sudo)
npm link
```

You should now be able to start the generator, if you execute

```bash
yo ego
```

### Start implementation

First create a feature branch with the name of the new generator:

```bash
git checkout -b my-new-generator
```

Then create a subfolder, called `my-new-generator`, inside the [/generators/app/gen](./generators/app/gen) directory with a `my-new-generator.js` file and use the following skeleton:

```javascript
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
    displayName: 'My Awesome Generator',
    icon: '👊',
};

/**
 * My new generator.
 */
exports.run = async function() {
    // 'this' contains the underlying Generator
    // instance based on: https://github.com/egodigital/generator-ego/blob/master/generators/app/index.js

    // create a 'my-new-generator' subfolder
    // inside '/generators/app/templates'
    // if needed
    // 
    // const TEMPLATES_DIR = this.templatePath('my-new-generator');

    const NAME = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the NAME of your project:`, {
                validator: true,
            }
        )
    ).trim();

    const DESCRIPTION = this.tools.toStringSafe(
        await this.tools.promptString(
            `Enter the DESCRIPTION of your project:`, {
                validator: true,
            }
        )
    ).trim();

    // create output directory
    // based on the project name
    const OUT_DIR = this.tools
        .mkDestinationDir(NAME.toLowerCase());


    // TODO: implement your generator
    //       s. https://github.com/egodigital/generator-ego/wiki
    console.log('Hello, e.GO!');


    // ask for initializing an empty
    // git repository
    await this.tools
        .askForGitInit(OUT_DIR);

    // ask if Visual Studio Code
    // should be opened
    await this.tools.askForOpenVSCode(
        OUT_DIR,
    );
};
```

To test your new generator, simply execute

```bash
yo ego
```

from another directory and select it from the list.

### Documentation

API documentation can be found [at the wiki](https://github.com/egodigital/generator-ego/wiki).

### Open pull request

* commit your changes
* sync them with your forked repository
* open a [pull request](https://github.com/egodigital/generator-ego/pulls) from your branch to our [master](https://github.com/egodigital/generator-ego)
