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

		//settings.cachedGameAvailable(false);
		//settings.cachedGameId(null);

		overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {
			if (data == undefined || data == null) { // manual start since no game is running
				outOfGameStart();
			} else { // automatic start since a game is running and the app will start with league
				inGameStart();
			}
		});

		/** App got started manually by the user */
		function outOfGameStart() {
			settings.startMatchCollapsed(false);
			main.start(SettingsModel.isSummonerSet());
			var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
			overwolf.benchmarking.requestFpsInfo(250, func);
		}

		/** App got started through overwolf */
		function inGameStart() {
			steal.dev.warn('App started through overwolf');
			if (!SettingsModel.isSummonerSet()) {
				main.start(false);
			} else {
				settings.startMatchCollapsed(false);
				main.constructor.addMatchStartOnStableFpsListener();
				var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
				overwolf.benchmarking.requestFpsInfo(250, func);
			}
		}
	});


