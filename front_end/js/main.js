// Entry point for index.html
require('Routes');

"use strict";
var MainCtrl = require('MainCtrl');
var SettingsModel = require('SettingsModel');

//MainCtrl.registerHotkeys();
MainCtrl.registerOverwolfHandlers();

var main = new MainCtrl('body');
var settings = new SettingsModel();

main.start(settings.isSummonerSet(), settings.hideHomeAtStart());
