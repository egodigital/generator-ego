[![npm](https://img.shields.io/npm/v/generator-ego.svg)](https://www.npmjs.com/package/generator-ego)

# generator-ego

A [Yeoman](http://yeoman.io/) generator with useful general sub generators and the possibility to be expand it by JavaScript. 

**The project is currently under heavy development! Feel free to [contribute](#contribute) and/or give us [your feedback](https://github.com/egodigital/generator-ego/issues).**

## Install

First keep sure to have Yeoman installed:

```bash
npm install -g yo
```

Now, you can install the generator by

```bash
npm install -g generator-ego
```

## Run

Simply execute

```bash
yo ego
```

from your console.

## Build in templates

| Name  | Description |
| ------------- | ------------- |
| `service-node-express-react` | Creates a service with a React frontend and database support. |

## Additional generators

Create a `yo-ego.js` file inside your home directory and use the following skeleton:

```javascript
// the keys are the display texts, which 
// are shown in the generator's menu
// at the beginning of the execution
exports.generators = {

    'My first generator': async function() {
        // 'this' contains the underlying Generator
        // instance: https://github.com/egodigital/generator-ego/blob/master/generators/app/index.js

        this.log(
            'From my 1st generator'
        );
    },

    // path to an external script file
    // 
    // the file must contain a public / exported
    // 'run()' function / method
    // 
    // relative paths will be mapped to the
    // user's home directory
    'My 2nd generator': 'my-2nd-generator.js',

};
```

Have a look at the `external-generator.example.js` file to get an idea, how to create a generator (file).

## Documentation

[Have a look at the wiki](https://github.com/egodigital/generator-ego/wiki) to learn more about that generator.

## Contribute

The [contribution guide](./CONTRIBUTION.md) explains, how to implement a new, build-in generator, work with the code and open a pull request.
