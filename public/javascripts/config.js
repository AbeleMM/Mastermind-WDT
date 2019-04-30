/* Code shared between client and server: game setup */

(function (exports) {
    
    exports.MAX_ALLOWED_GUESSES = 8;                /* Maximum number of guesses */
    exports.WEB_SOCKET_URL = location.origin.replace(/^http/, 'ws'); /* WebSocket URL */
    exports.COLOR_NAMES={"r": "red", "g": "green", "b": "blue", "y": "yellow", "o": "orange", "p": "purple"}; /* Allowed colors letter codes */
    exports.NR_COLORS = 4;

} (typeof exports === "undefined" ? this.Setup = {} : exports));
//if exports is undefined, we are on the client; else the server