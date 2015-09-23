/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for main.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'MainCtrl.js'
	, 'SettingsModel.js'
	, 'Routes.js'
	, function (/** MainCtrl */ MainCtrl
		, /** SettingsModel*/ SettingsModel
		, /** Routes */ Routes) {

		Routes.ready();

		var main = new MainCtrl('html');
		main.constructor.registerOverwolfHandlers();
		localStorage.setItem('lock_getCachedGame', "0"); // TODO: move into Settings
		localStorage.removeItem('temp_gameId'); // TODO: move into Settings

		var settings = new SettingsModel();

		overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {
			if (data == undefined || data == null) { // manual start since no game is running
				manualAppStart();
			} else { // automatic start since a game is running and the app will start with league
				automaticAppStart();
			}
		});

		/** App got started manually by the user */
		function manualAppStart() {
			settings.attr('startMatchCollapsed', false); // TODO: move into settings when refactoring settings.js
			main.start(settings.isSummonerSet());
		}

		/** App got started through overwolf */
		function automaticAppStart() {
			// here we assume summoner already got set somewhen, else this option couldn't have been set
			if (!settings.hideHomeAtStart()) {
				main.start(settings.isSummonerSet());
			}
			settings.attr('startMatchCollapsed', true); // TODO: move into settings when refactoring settings.js
			if (settings.isSummonerSet()) { // If Summoner is set start the matchwindow right away
				main.constructor.openMatch();
			} // otherwise user has to open it manually ot start a game after setting the summoner
		}
	});


