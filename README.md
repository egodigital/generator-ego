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
| `api-node-express` | Creates a REST api host based on [express](https://www.npmjs.com/package/express) |
| `api-php-slim` | Creates a REST api host based on [Slim](https://www.slimframework.com/) |
| `app-electron-mdbootstrap` | Creates an [Electron](https://github.com/SimulatedGREG/electron-vue) app based on [MD Bootstrap for Vue](https://mdbootstrap.com/docs/vue/) |
| `app-reactnative-blank` | Creates a blank [React Native](https://facebook.github.io/react-native/) app |
| `html5` | Creates HTML page based on [HTML 5 Boilerplate](https://html5boilerplate.com/) |

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

To contribute, you can [open an issue](https://github.com/egodigital/generator-ego/issues) and/or fork this repository.

To work with the code:

* clone this repository
* create and change to a new branch, like `git checkout -b my_new_feature`
* run `npm install` from your project folder to install dependencies
* run `npm link` from your project folder, so you are able to test your changes (this might require admin rights, like `sudo`, e.g.)
* to test your changes, run `yo ego`
* commit your changes to your new branch and sync it with your forked GitHub repo
* make a [pull request](https://github.com/egodigital/generator-ego/pulls)

## Copyright

### app-electron-mdbootstrap

That template makes use of free version of [MD Bootstrap](https://mdbootstrap.com/vue) and is based on [electron-vue](https://github.com/SimulatedGREG/electron-vue).
