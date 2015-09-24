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
		var settings = new SettingsModel();

		main.constructor.registerOverwolfHandlers();

		settings.cachedGameAvailable(false);
		settings.cachedGameId(null);

		overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {
			if (data == undefined || data == null) { // manual start since no game is running
				manualAppStart();
			} else { // automatic start since a game is running and the app will start with league
				automaticAppStart();
			}
		});

		/** App got started manually by the user */
		function manualAppStart() {
			settings.startMatchCollapsed(false);
			main.start(SettingsModel.isSummonerSet());
		}

		/** App got started through overwolf */
		function automaticAppStart() {
			// here we assume summoner already got set somewhen, else this option couldn't have been set
			if (!SettingsModel.hideHomeAtStart()) {
				main.start(SettingsModel.isSummonerSet());
			}
			settings.startMatchCollapsed(true);
			if (SettingsModel.isSummonerSet()) { // If Summoner is set start the matchwindow right away
				main.constructor.openMatch();
			} // otherwise user has to open it manually ot start a game after setting the summoner
		}
	});


