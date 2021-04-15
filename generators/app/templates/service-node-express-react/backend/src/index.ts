import 'reflect-metadata';  // THIS HAS TO BE INCLUDED VERY FIRST!!!

// .env.local?
if (require('fs').existsSync(__dirname + '/../.env.local')) {
    require('dotenv').config({
        path: __dirname + '/../.env.local'
    });
}

// this has to be very first
import 'moment';
import 'moment-timezone';
import './constants';

import express from 'express';
import { createApp } from './app';
import { BACKEND_PORT } from './constants';
import { logger } from './diagnostics';
import { initHost } from './host';

/**
 * Main entry point.
 */
async function main() {
    const host = express();

    const app = await createApp(host);

    await initHost(app);

    host.listen(BACKEND_PORT, () => {
        logger.info(`🚀🙌🎉 Backend now running on port ${BACKEND_PORT} 🎉🙌🚀`, {
            file: __filename,
            func: 'host.listen'
        });
    });
}

main();