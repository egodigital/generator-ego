import * as api_v1_root from './api/v1/root';
import * as contracts from './contracts';
import * as egoose from '@egodigital/egoose';
import * as express from 'express';

type InitApiAction = (api: contracts.ApiContext, root: express.Router) => void;

function createHost() {
    const HOST = express();

    const CONTEXT: contracts.ApiContext = {
        host: HOST,
    };

    // v1 API
    {
        const v1_ROOT = express.Router();
        HOST.use('/api/v1', v1_ROOT);

        v1_ROOT.use(function(req, res, next) {
            // overwrite this, if you would like
            // to implement an authorization
            // workflow, e.g.

            return next();
        });

        // extend that list if other
        // action for initializing endpoints
        const INIT_ACTION: InitApiAction[] = [
            api_v1_root.init,
        ];

        for (const ACTION of INIT_ACTION) {
            ACTION(CONTEXT, v1_ROOT);
        }
    }

    return HOST;
}

(async () => {
    const HOST = createHost();

    let port = parseInt(egoose.toStringSafe(process.env.APP_PORT).trim());
    if (isNaN(port)) {
        port = 8080;
    }

    let host = egoose.toStringSafe(process.env.APP_HOST).trim();
    if ('' === host) {
        host = '0.0.0.0';
    }

    HOST.listen(port, host, () => {
        console.log(
            `API now runs on http://${host}:${port} ...`
        );
    });
})();