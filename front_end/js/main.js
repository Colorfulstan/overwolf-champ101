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

		//Routes.ready();

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
			if (!SettingsModel.isSummonerSet()) {
				main.start(false);
			} else {
				settings.startMatchCollapsed(true);
				main.constructor.openMatch();
			}
		}
	});


