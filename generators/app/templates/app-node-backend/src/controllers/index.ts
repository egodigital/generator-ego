import * as _ from 'lodash';
import { GET, Swagger } from '@egodigital/express-controllers';
import { ControllerBase, Request, Response } from './_share';

/**
 * Base path: /
 */
export class Controller extends ControllerBase {
    /**
     * [GET] /
     */
    @Swagger({
        "summary": "Returns 'success'.",
        "produces": [
            "application/json",
        ],
        "responses": {
            "200": {
                "description": "Operation was successful.",
                "schema": {
                    "$ref": "#/definitions/SimpleResult"
                }
            },
        }
    })
    @GET('/')
    public async index(req: Request, res: Response) {
        return res.json({
            success: true,
        });
    }
}