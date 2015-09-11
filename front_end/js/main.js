// Entry point for index.html
"use strict";
var MainCtrl = require('MainCtrl');
var SettingsModel = require('SettingsModel');

var Routes = require('Routes');
Routes.ready();

//MainCtrl.registerHotkeys();

var main = new MainCtrl('html');
main.constructor.registerOverwolfHandlers();

var settings = new SettingsModel();

overwolf.games.getRunningGameInfo(function(data){
	if (data == undefined || data == null){ // manual start since no game is running
		main.start(settings.isSummonerSet());
	} else { // automatic start since a game is running and the app will start with league
		// here we assume summoner already got set somewhen, else this option couldn't have been set
		if (!settings.hideHomeAtStart()){
			main.start(settings.isSummonerSet());
		}
		main.constructor.openMatch();
	}
});
