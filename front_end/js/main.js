// Entry point for index.html
require('Routes');

"use strict";
var MainCtrl = require('MainCtrl');
var SettingsModel = require('SettingsModel');

//MainCtrl.registerHotkeys();

var main = new MainCtrl('html');
main.constructor.registerOverwolfHandlers();

var settings = new SettingsModel();

if (settings.hideHomeAtStart() && main.constructor.gameStarted()){ // here we assume summoner already got set somewhen, else this option couldn't have been set
	main.constructor.openMatch();
} else { // TODO: something s wrong here but it works for now
	main.start(settings.isSummonerSet());
}
