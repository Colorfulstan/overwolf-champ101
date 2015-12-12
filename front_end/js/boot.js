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

		var firstStart = !SettingsModel.isSummonerSet();  // localStorage has no items on first start

		// TODO: all that follows belongs in an object / controller / whatever to be able to test it
		checkIfIngame(settings)
			.then(launchApp.bind(null, firstStart, settings))
			.fail(console.error);

		function launchApp(isFirstStart, settings, data) {
			if (isFirstStart) {
				return firstAppLaunch(settings).always(registerAppListeners.bind(null, settings));
			} else {
				regularLaunch(settings);
			}
		}

		function firstAppLaunch(settings) {
			return setDefaultSettings(settings)
				.then(askForSummoner)
				.then(showMatchLoading.bind(null, settings))
				.then(openMatchIfIngame)
				.always(openMainWindow);

			function setDefaultSettings(settings) {
				settings.startWithGame(true);
				settings.closeMatchWithGame(true);
				settings.isFpsStable('true');
				return $.Deferred().resolve().promise();
			}
		}

		function showMatchLoading(settings, data) {
			settings.isManualReloading(true);
			settings.startMatchCollapsed(false);
			return $.Deferred().resolve().promise();
		}
		function hideMatchLoading(settings, data) {
			settings.isManualReloading(false);
			settings.startMatchCollapsed(true);
			return $.Deferred().resolve().promise();
		}


		function checkIfIngame(settings) {
			var def = $.Deferred();
			// NOTE: first of two points where app determines if player is within a game
			// other point is through listener (registerOverwolfListener)
			overwolf.games.getRunningGameInfo(function (/** GameInfo */ gameData) {
				var isInGame = !(gameData == undefined || gameData == null);
				settings.isInGame(isInGame);
				def.resolve(isInGame);
			});
			return def.promise();
		}

		function askForSummoner() {
			var def = $.Deferred();
			WindowCtrl.openSettings();
			var interval = window.setInterval(function () {
				$.when(WindowCtrl.isWindowVisible('Settings')).then(function (settingsOpen) {
					if (!settingsOpen) {
						if (SettingsModel.isSummonerSet()) {
							def.resolve();
						} else {
							def.reject();
						}
						window.clearInterval(interval);
					}
				});
			}, 100);
			return def.promise();
		}

		function openMatchIfIngame() {
			if (SettingsModel.isInGame()) {
				MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
				MainCtrl.addStableFpsListener();
				overwolf.benchmarking.requestFpsInfo(250, function () {});
				return WindowCtrl.openMatch();
			}
			return $.Deferred().reject().promise();
		}

		function openMainWindow() {
			return WindowCtrl.openMain();
		}

		function registerAppListeners(settings, data) {
			if (SettingsModel.startWithGame()) {
				MainCtrl.registerGameStartListeners(settings);
			}

			// in case app started previous and gets reopened by user
			overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) { // each time Main-Window gets opened (app manually started)
				checkIfIngame(settings)
					.then(function () {
						var def = $.Deferred();
						SettingsModel.isSummonerSet() ? def.resolve() : def.reject();
						return def.promise();
					}).then(showMatchLoading.bind(null, settings))
					.then(openMatchIfIngame, firstAppLaunch.bind(null, settings))
					.fail(console.error);
			});
			return $.Deferred().resolve().promise();
		}


		function regularLaunch(settings) {
			registerAppListeners(settings);

			//settings.cachedGameAvailable(false);
			//settings.cachedGameId(null);
			if (settings.isInGame()) {
				inGameStart(settings);
			} else {
				outOfGameStart(settings); // TODO: make asynch
			}
		}

		/** App got started manually by the user */
		function outOfGameStart(settings) {
			settings.startMatchCollapsed(false);
			openMainWindow();
			var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
			overwolf.benchmarking.requestFpsInfo(250, func);
		}

		/** App got started through overwolf */
		function inGameStart(settings) {
			// NOTE: only case in which inGameStart won't be automatic through overwolf is, if overwolf gets started after the match already started!
			checkIfAutoLaunched()
				.then(function (wasAutoLaunched) {
					if (wasAutoLaunched && !SettingsModel.startWithGame()) {
						return false; // App should not start automatically
					}
					wasAutoLaunched ? hideMatchLoading(settings) : showMatchLoading(settings);
					MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
					MainCtrl.addStableFpsListener();
					var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
					overwolf.benchmarking.requestFpsInfo(250, func);
					WindowCtrl.openMatch();
				});
		}

		/**
		 * @returns {Promise | boolean}
		 */
		function checkIfAutoLaunched() { // TODO: not sure if this works as intended
			// if app is started manually, the main-window will open anyways.
			// So if that window is not present, the game was started through auto-launch
			// TODO: change main-window to some kind of indicator-window so that main-window don't have to open when app gets started manually

			var def = $.Deferred();
			WindowCtrl.isWindowVisible('Main').then(function (isVisible) {
				if (!isVisible) steal.dev.warn('App started through overwolf');
				def.resolve(!isVisible);
			});
			return def.promise();
		}

		// public API for testing purposes // TODO: work this out
		//return {
		//}
	});


