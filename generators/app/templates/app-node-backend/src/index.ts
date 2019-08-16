import 'reflect-metadata';
import * as database from './database';
import * as diagnostics from './diagnostics';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';
import * as fs from 'fs-extra';
import * as host from './host';
import { AppContext } from './contracts';

(async () => {
    let hostAddr = egoose.toStringSafe(process.env.APP_HOST)
        .trim();
    if ('' === hostAddr) {
        hostAddr = '0.0.0.0';
    }

    let port = parseInt(
        egoose.toStringSafe(process.env.APP_PORT)
    );
    if (isNaN(port)) {
        port = 80;
    }

    const HOST = express();

    const APP: AppContext = {
        host: HOST,
        logger: diagnostics.LOGGER,
        package: JSON.parse(
            await fs.readFile(
                __dirname + '/../package.json',
                'utf8'
            )
        ),
        withDatabase: async (action) => {
            let conn = database.createDatabaseConnection();
            conn = await conn.connect();

            try {
                return await Promise.resolve(
                    action(conn)
                );
            } finally {
                await conn.close();
            }
        },
    };

    await diagnostics.initLogger(APP);
    await host.initHost(APP);

    HOST.listen(port, hostAddr, () => {
        if (egoose.IS_LOCAL_DEV) {
            APP.logger
                .info(`🎉🎉🎉  Backend now runs on port ${port}  🎉🎉🎉`, 'boot');
        }
    });
})();