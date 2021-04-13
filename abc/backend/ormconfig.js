const path = require('path');

const isLocalDev = process.env.LOCAL_DEVELOPMENT === '1';


// file extensions
let ext;
if (isLocalDev) {
    ext = 'ts';
} else {
    ext = 'js';
}
ext = '.' + ext;


// base path
let basePath = __dirname;
if (isLocalDev) {
    basePath = path.join(
        basePath, 'src'
    );
} else {
    basePath = path.join(
        basePath, 'dist'
    );
}
basePath = path.join(
    basePath, 'database'
);


module.exports = {
    type: 'postgres',

    ssl: !isLocalDev && process.env.DB_SSL === '1',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,

    synchronize: false,
    logging: isLocalDev,

    entities: [
        basePath + '/entity/*' + ext
    ],

    migrations: [
        basePath + '/migration/*' + ext
    ],
    migrationsTableName: 'migrations',

    subscribers: [
        basePath + '/subscriber/*' + ext
    ]
};
