/* eslint-disable require-await */
import { GET, POST, schema, Swagger } from '@egodigital/express-controllers';
import { ApiV1ControllerBase, ApiV1Request, ApiV1Response } from './_share';

interface IPost {
    foo: 'bar' | 'baz';
}

const postSchema = schema.object({
    foo: schema.string().allow('bar', 'baz').required()
});

/**
 * Base path: '/api/v1'
 */
export class Controller extends ApiV1ControllerBase {
    @GET({
        path: '/'
    })
    @Swagger({
        summary: 'A GET test.',
        responses: {
            '200': {
                description: 'The response.',
                schema: {
                    $ref: '#/definitions/GetTestResponse'
                }
            }
        }
    })
    public async getTest(req: ApiV1Request, resp: ApiV1Response) {
        // s. ApiV1ControllerBase.__serialize()
        return {
            message: 'Hello, e.GO!'
        };
    }

    @POST({
        path: '/',
        schema: postSchema
    })
    @Swagger({
        summary: 'A POST test.',
        parameters: [
            {
                in: 'body',
                name: 'body',
                description: 'The request data.',
                required: true,
                schema: {
                    $ref: '#/definitions/PostTestRequest'
                }
            }
        ],
        responses: {
            '200': {
                description: 'The response.',
                schema: {
                    $ref: '#/definitions/PostTestResponse'
                }
            }
        }
    })
    public async postTest(req: ApiV1Request, resp: ApiV1Response) {
        const body: IPost = req.body;

        // s. ApiV1ControllerBase.__serialize()
        return {
            message: 'Your foo: ' + body.foo
        };
    }
}
