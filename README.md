# generator-ego

A [Yeoman](http://yeoman.io/) generator with useful general sub generators and the possibility to be expand it by JavaScript. 

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

## Additional generators

Create a `yo.js` file inside your home directory and use the following skeleton:

```javascript
// the keys are the display texts, which 
// are shown in the generator's menu
// at the beginning of the execution
exports.generators = {

    'My first generator': async function() {
        // 'this' contains the underlying Generator
        // instance: http://yeoman.io/generator/Generator.html

        console.log(
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

## Contribute

To contribute, you can [open an issue](https://github.com/egodigital/generator-ego/issues) and/or fork this repository.

To work with the code:

* clone this repository
* create and change to a new branch, like `git checkout -b my_new_feature`
* run `npm install` from your project folder to install dependencies
* run `npm link` from your project folder, so you are able to test your changes
* to test your changes, run `yo ego`
* commit your changes to your new branch and sync it with your forked GitHub repo
* make a [pull request](https://github.com/egodigital/generator-ego/pulls)
