import { remote } from 'electron';

export default {
    /**
     * Returns the '@egodigital/egoose' module.
     */
    egoose() {
        return this.getGlobal('__egoose');
    },
    /**
     * Returns the command line arguments.
     * 
     * @return {Array} The list of command line arguments.
     */
    getArgs() {
        return this.getGlobal('__args') || [];
    },
    /**
     * Gets the global event emitter.
     */
    getEvents() {
        return this.getGlobal('__events');
    },
    /**
     * Gets a global value, which is shared between the app and the WebView.
     *
     * @param {String} key The name of the value.
     * 
     * @return {any} The value.
     */
    getGlobal(key) {
        return remote.getGlobal(
            String(key)
        );
    },
    /**
     * Gets if the app runs in development mode or not.
     * 
     * @return {Boolean} Runs in development mode or not.
     */
    isLocalDev() {
        return this.getGlobal('__isLocalDev');
    },
}
