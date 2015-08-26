'use strict';
function Settings(){}

/** Set this to true to get debug Information on the console @private */
Settings._debug = true;

Settings._regionKey = 'region-code';
Settings._nameKey = 'summoner-name';
Settings._idKey = 'summoner-id';

Settings.server = function(regionCode) {
    if (regionCode) {localStorage.setItem(Settings._regionKey, regionCode); return true}
    return localStorage.getItem(Settings._regionKey);
};

Settings.summonerName = function(name) {
    if (name){ localStorage.setItem(Settings._nameKey, name); return true; }
    return localStorage.getItem(Settings._nameKey)
};

Settings.summonerId = function(id) {
    if (id){ localStorage.setItem(Settings._idKey, id); return true; }
    return localStorage.getItem(Settings._idKey)
};

Settings.clearSummonerId = function() {
    return localStorage.removeItem(Settings._idKey)
};

Settings.isSummonerSet = function(){
    return localStorage.getItem(Settings._idKey);
};

Settings.isDebugging = function () {
    return Settings._debug;
};
