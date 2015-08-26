'use strict';

function Error(){}

Error.summonerSettings = function(msg){
    jQuery('#error-msg').text(msg);
};

Error.matchNotFound = function (msg) {
    jQuery('#error-msg').text(msg);
};