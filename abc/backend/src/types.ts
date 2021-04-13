/**
 * A cache (client).
 */
export interface ICache {
    /**
     * Removes all entries.
     *
     * @returns {Promise<boolean>} The promise that indicates if operation was successful or not.
     */
    flush(): Promise<boolean>;
    /**
     * Tries to return a value from cache by key.
     *
     * @param {string} key The key.
     * @param {TDefault} [defaultValue] The custom default value.
     *
     * @returns {Promise<TResult|TDefault|undefined>} The promise with the value or the default value.
     */
    get<TResult extends any = any>(key: string): Promise<TResult | undefined>;
    get<TResult, TDefault>(key: string, defaultValue: TDefault): Promise<TResult | TDefault>;
    /**
     * Sets or deletes a value.
     *
     * @param {string} key The key.
     * @param {any} value The (new) value. A value of (null) or (undefined) will delete the value of a key.
     * @param {number|false} [ttl] The time in seconds, the value "lives". (false) indicates that the value does not become invalid and "lives forever".
     *
     * @returns {Promise<boolean>} The promise, that indicates if operation was successful or not.
     */
    set(key: string, value: any, ttl?: number | false): Promise<boolean>;
}