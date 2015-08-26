'use strict';
function Settings(){}

/** Set this to true to get debug Information on the console @private */
Settings._debug = true;

Settings.isDebugging = function () {
    return Settings._debug;
};
