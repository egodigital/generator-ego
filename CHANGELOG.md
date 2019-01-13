# Change Log (generator-ego)

## 0.14.0

* added `app-node-typescript` generator for blank [Node.js](https://nodejs.org/) based apps, written in [TypeScript](https://www.typescriptlang.org/)
* improved `api-node-express` generator
* updated the following [npm](https://www.npmjs.com/) modules:
  * [@egodigital/egoose](https://www.npmjs.com/package/@egodigital/egoose) `^3.6.0`
  * [got](https://www.npmjs.com/package/got) `^9.5.1`
  * [chalk](https://www.npmjs.com/package/chalk) `^2.4.2`
  * [xml-js](https://www.npmjs.com/package/xml-js) `^1.6.9`

## 0.13.1

* bugfixes
* optimized `downloadGitRepo()` method of [tools](https://github.com/egodigital/generator-ego/blob/master/generators/app/tools.js) class
* updated to `got@9.5.0`
* updated to `moment@2.23.0`
* updated to `yeoman-generator@3.2.0`

## 0.12.1

* updated to `@egodigital/egoose@3.5.1`

## 0.12.0

* updated to `@egodigital/egoose@3.5.0`
* updated to `got@9.4.0`

## 0.11.0

* added [egoose](https://www.npmjs.com/package/@egodigital/egoose) property to [generator](https://github.com/egodigital/generator-ego/blob/master/generators/app/index.js) class
* make use of more console spinners

## 0.10.0

* added `sleep()`, `withSpinner()` and `withSpinnerSync()` methods to [tools](https://github.com/egodigital/generator-ego/blob/master/generators/app/tools.js) class

## 0.9.0

* added `hasSSHKeys()`, `isDir()` and `isFile()` methods to [tools](https://github.com/egodigital/generator-ego/blob/master/generators/app/tools.js) class

## 0.8.0

* added [signale](https://www.npmjs.com/package/signale) console logger with helper methods

## 0.7.2

* bug and other minor fixes

## 0.6.0

using `stat()` instead of `lstat()`

## 0.5.1

* extended `api-node-express` generator

## 0.4.0

* `api-node-express` generator asks for MongoDB backend now

## 0.3.0

* added `asArray()`, `copy()` and `doesMatch()` methods to [tools](https://github.com/egodigital/generator-ego/blob/master/generators/app/tools.js) class

## 0.1.0

* initial release
