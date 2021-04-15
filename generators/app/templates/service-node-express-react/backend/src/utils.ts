import _ from 'lodash';
import fs from 'fs';
import path from 'path';

const readFile = fs.promises.readFile;

/**
 * Returns the full path of a file insice 'res' subfolder.
 *
 * @param {string} file The (relative) path to the file.
 *
 * @returns {string} The full path.
 */
export function getResourcePath(file: string): string {
    return path.resolve(
        path.join(
            __dirname, 'res', file,
        )
    );
}

/**
 * Loads a file from 'res' subfolder.
 *
 * @param {string} file The (relative) path to the file.
 *
 * @returns {Promise<Buffer>} The promise with the loaded data.
 */
export function loadResource(file: string): Promise<Buffer> {
    return readFile(
        getResourcePath(file)
    );
}

/**
 * Loads a file from 'res' subfolder.
 *
 * @param {string} file The (relative) path to the file.
 *
 * @returns {Buffer} The loaded data.
 */
export function loadResourceSync(file: string): Buffer {
    return fs.readFileSync(
        getResourcePath(file)
    );
}

/**
 * Executes an action on the next processor tick.
 *
 * @param {Function} action The action to invoke.
 *
 * @returns {Promise<TResult>} The promise with the result of the action.
 */
export function tick<TResult extends any = any>(
    action: () => Promise<TResult>
): Promise<TResult> {
    return new Promise<TResult>((resolve, reject) => {
        process.nextTick(() => {
            try {
                action().then(resolve)
                    .catch(reject);
            } catch (ex) {
                reject(ex);
            }
        });
    });
}

/**
 * Returns a value as string, that is not (null) and not (undefined).
 *
 * @param {any} val The input value.
 *
 * @returns {string} The output value.
 */
export function toStringSafe(val: any): string {
    if (typeof val === 'string') {
        return val;
    }

    if (!_.isNil(val)) {
        try {
            if (typeof val['toString'] === 'function') {
                return String(val.toString());
            }

            return String(val);
        } catch { }
    }

    return '';
}
