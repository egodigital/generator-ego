import * as egoose from '@egodigital/egoose';
import * as path from 'path';

/**
 * Returns the full path of a file insice 'res' subfolder.
 *
 * @param {string} file The (relative) path to the file.
 *
 * @return {string} The full path.
 */
export function getResourcePath(file: string): string {
    return path.resolve(
        path.join(
            __dirname, 'res',
            egoose.toStringSafe(file),
        )
    );
}