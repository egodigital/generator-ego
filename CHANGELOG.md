# Change Log (generator-ego)

## 0.20.0

* generator requires at least [Node.js 10+](https://nodejs.org/dist/latest-v10.x/docs/api/) now
* updated the following [npm](https://www.npmjs.com/) modules:
  * [ejs](https://www.npmjs.com/package/@egodigital/egoose) `^6.7.1`

## 0.19.0

* updated the following [npm](https://www.npmjs.com/) modules:
  * [ejs](https://www.npmjs.com/package/ejs) `^2.6.2`
  * [ora](https://www.npmjs.com/package/ora) `^3.4.0`

## 0.18.0

* `tableau-html` generator now supports objects as data source
* updated the following [npm](https://www.npmjs.com/) modules:
  * [opn](https://www.npmjs.com/package/opn) `^5.5.0`

## 0.17.0

* added `app-electron-vuetify` generator for [Electron](https://electronjs.org/) apps, based on [Vuetify](https://vuetifyjs.com/)
* updated the following [npm](https://www.npmjs.com/) modules:
  * [ora](https://www.npmjs.com/package/ora) `^3.2.0`
  * [signale](https://www.npmjs.com/package/signale) `^1.4.0`
  * [xml-js](https://www.npmjs.com/package/xml-js) `^1.6.11`

## 0.16.2

* added `app-vue-vuetify` generator for [Vue](https://vuejs.org/) based web pages with [Vuetify](https://vuetifyjs.com/)
* added [confirm()](https://github.com/egodigital/generator-ego/wiki#confirmmessage-opts-) method to [tools](https://github.com/egodigital/generator-ego/wiki#tools-) namespace
* (bug)fixes

## 0.15.1

* added `tableau-html` generator to generator simple [web connectors](https://onlinehelp.tableau.com/current/pro/desktop/en-us/examples_web_data_connector.htm) for [Tableau](https://www.tableau.com/)
* added `app-vue-mdbootstrap` generator for [Vue](https://vuejs.org/) based web pages with [MD Bootstrap Free](https://mdbootstrap.com/docs/vue/)
* [copy()](https://github.com/egodigital/generator-ego/wiki#copyfrom-to-patterns-excludes-) method of [tools](https://github.com/egodigital/generator-ego/wiki#tools-) namespace now copyies even dot files
* updated the following [npm](https://www.npmjs.com/) modules:
  * [@egodigital/egoose](https://www.npmjs.com/package/@egodigital/egoose) `^3.8.0`
  * [got](https://www.npmjs.com/package/got) `^9.6.0`
  * [moment](https://www.npmjs.com/package/moment) `^2.24.0`

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
