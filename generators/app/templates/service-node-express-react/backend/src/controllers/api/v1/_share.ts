import _ from 'lodash';
import isStream from 'is-stream';
import { RequestErrorHandlerContext, ResponseSerializerContext, serializeForJSON } from '@egodigital/express-controllers';
import { ControllerBase, ControllerResult, Request, Response } from '../../_share';
import { logger } from '../../../diagnostics';
import { toStringSafe } from '../../../utils';
import { IS_LOCAL_DEV } from '../../../constants';

/**
 * An extended request object.
 */
export interface ApiV1Request extends Request {
}

/**
 * An extended response object.
 */
export interface ApiV1Response extends Response {
}

/**
 * A basic API v1 controller.
 */
export abstract class ApiV1ControllerBase extends ControllerBase {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async __error(context: RequestErrorHandlerContext<ApiV1Request>) {
        const { error, response } = context;

        logger.error(toStringSafe(error), {
            file: __filename,
            func: 'ApiV1ControllerBase.__error()'
        });

        if (!response.headersSent) {
            response.status(500);
        }

        let data: any;
        if (IS_LOCAL_DEV) {
            data = {
                message: toStringSafe(error)
            };
        }

        return response.json({
            success: false,
            data
        });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public async __serialize(context: ResponseSerializerContext<ApiV1Request>) {
        const { response, result } = context;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        let success = true;
        let data: any = result;
        let code = 200;

        const sendStatusCode = () => {
            if (!response.headersSent) {
                response.status(code);
            }

            return response;
        };

        if (result instanceof ControllerResult) {
            code = result.code;
            success = code < 400;
            data = await Promise.resolve(result.getData());
        }

        if (isStream.readable(data)) {
            sendStatusCode();

            return data.pipe(response);
        }

        if (Buffer.isBuffer(data)) {
            return sendStatusCode()
                .send(data);
        }

        if (code === 204) {
            return sendStatusCode()
                .send();
        }

        return sendStatusCode().json({
            success,
            data: await serializeForJSON(data)
        });
    }
}
