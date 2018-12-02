const fs = require('fs');

exports.downloaded = async function(e) {
    // 'this' contains the underlying Generator
    // instance based on: https://github.com/egodigital/generator-ego/blob/master/generators/app/index.js

    fs.writeFileSync(
        e.dir + '/test.txt',
        `Test from downloaded Git repo: ${ new Date() }`,
        'utf8'
    );
};
