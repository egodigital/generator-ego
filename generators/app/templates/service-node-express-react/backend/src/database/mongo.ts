import mongoose, { Mongoose } from 'mongoose';
import { tick } from '../utils';
import { Nilable } from '@egodigital/types';

/**
 * Describes an action for a 'withDB()' function call.
 *
 * @param {Mongoose} conn The current connection.
 *
 * @returns {TResult|PromiseLike<TResult>} The result of the action.
 */
export type WithMongoAction<TResult extends any = any> =
    (conn: Mongoose) => TResult | PromiseLike<TResult>;

/**
 * Invokes an action for an open Mongo connection, and closes it after it is not used anymore.
 *
 * @param {WithMongoAction<TResult>} action The action to invoke.
 * @param {Mongoose} [connection] The custom connection to use.
 *
 * @returns {Promise<TResult>} The promise with the result of the action.
 */
export async function withMongo<TResult extends any = any>(
    action: WithMongoAction<TResult>, connection?: Nilable<Mongoose>
): Promise<TResult> {
    return tick(async () => {
        if (!connection) {
            connection = await mongoose.connect(process.env.MONGO_CONNECTION!, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true
            });
        }

        return action(connection);
    });
}
