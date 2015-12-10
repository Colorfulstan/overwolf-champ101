/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for main.html
// Only gets executed with the first start after overwolf restart
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

		if (SettingsModel.startWithGame()) {
			main.constructor.registerOverwolfHandlers();
		}

		// in case app started previous and gets reopened by user
		overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
			if (settings.isInGame()) {
				WindowCtrl.openMatch();
			}
		});

		//settings.cachedGameAvailable(false);
		//settings.cachedGameId(null);

		// NOTE: first of two points where app determines if player is within a game
		// other point is through listener
		overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {
			if (data == undefined || data == null) { // manual start since no game is running
				settings.isInGame(false);
				outOfGameStart();
			} else { // automatic start since a game is running and the app will start with league
				settings.isInGame(true);
				inGameStart();
			}
		});

		/** App got started manually by the user */
		function outOfGameStart() {
			settings.startMatchCollapsed(false);
			if (!SettingsModel.isSummonerSet()) {
				settings.startWithGame(true);
			}
			main.start(SettingsModel.isSummonerSet());
			var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
			overwolf.benchmarking.requestFpsInfo(250, func);
		}

		/** App got started through overwolf */
		function inGameStart() {
			// NOTE: only case in which inGameStart won't be automatic through overwolf is, if overwolf gets started after the match already started!
			isStartedThroughGameLaunch().then(function (wasAutoLaunched) {
				if (wasAutoLaunched && !SettingsModel.startWithGame()) {
					return false;
				}
				if (!SettingsModel.isSummonerSet()) {
					settings.startWithGame(true);
					settings.closeMatchWithGame(true);
					main.start(false);
				} else {
					WindowCtrl.openMatch();
					settings.startMatchCollapsed(true);
					main.constructor.removeStableFpsListener(); // to prevent unwanted listener-stacking
					main.constructor.addStableFpsListener();
					var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
					overwolf.benchmarking.requestFpsInfo(250, func);
				}
			});
		}

		/**
		 * @returns {Promise | boolean}
		 */
		function isStartedThroughGameLaunch() { // TODO: not sure if this works as intended
			// if app is started manually, the main-window will open anyways.
			// So if that window is not present, the game got started through auto-launch
			// TODO: change main-window to some kind of indicator-window so that main-window don't have to open when app gets started manually

			var def = $.Deferred();
			WindowCtrl.isWindowVisible('Main').then(function (isVisible) {
				if (!isVisible) steal.dev.warn('App started through overwolf');
				def.resolve(!isVisible);
			});
			return def.promise();
		}
	});


