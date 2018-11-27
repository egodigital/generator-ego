const fs = require('fs');

exports.downloaded = async function(e) {
    // 'this' contains the underlying Generator
    // instance based on: http://yeoman.io/generator/Generator.html

    fs.writeFileSync(
        e.dir + '/test.txt',
        `Test from downloaded Git repo: ${ new Date() }`,
        'utf8'
    );
};
