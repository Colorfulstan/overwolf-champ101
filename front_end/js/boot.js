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

		checkIfIngame().then(function (isInGame) {
			settings.isInGame(isInGame);

			if (firstStart) {
				firstAppStart(settings);
			} else {
				regularStart(settings);
			}
		});

		function firstAppStart(settings) {
			setDefaultSettings(settings)
				.then(askForSummoner)
				.then(openMatchIfIngame)
				.always(openMainWindow)
				.always(setupListener);

			function setDefaultSettings(settings) {
				settings.startWithGame(true);
				settings.closeMatchWithGame(true);
				return $.Deferred().resolve().promise();
			}
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

		function setupListener() {
			if (SettingsModel.startWithGame()) {
				MainCtrl.registerOverwolfHandlers();
			}

			// in case app started previous and gets reopened by user
			overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
				if (!SettingsModel.isSummonerSet()) {
					WindowCtrl.openSettings();
				} else {
					openMatchIfIngame();
				}
			});
			return $.Deferred().resolve().promise();
		}

		function checkIfIngame() {
			var def = $.Deferred();
			// NOTE: first of two points where app determines if player is within a game
			// other point is through listener
			overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {
				if (data == undefined || data == null) { // manual start since no game is running
					def.resolve(false);
				} else { // automatic start since a game is running and the app will start with league
					def.resolve(true);
				}

			});
			return def.promise();
		}

		function openMatchIfIngame() {
			if (SettingsModel.isInGame()) {
				var settings = new SettingsModel();
				settings.isReloading(true);
				return WindowCtrl.openMatch();
			}
			return $.Deferred().reject().promise();
		}

		function openMainWindow() {
			return WindowCtrl.openMain();
		}

		function regularStart(settings) {
			setupListener();

			//settings.cachedGameAvailable(false);
			//settings.cachedGameId(null);
			if (settings.isInGame()) {
				inGameStart(settings);
			} else {
				outOfGameStart(settings);
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
			checkIfAutoLaunched().then(function (wasAutoLaunched) {
				if (wasAutoLaunched && !settings.startWithGame()) {
					return false; // App should not start automatically
				}
				settings.startMatchCollapsed(true);
				MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
				MainCtrl.addStableFpsListener();
				WindowCtrl.openMatch();
				var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
				overwolf.benchmarking.requestFpsInfo(250, func);
			});
		}

		/**
		 * @returns {Promise | boolean}
		 */
		function checkIfAutoLaunched() { // TODO: not sure if this works as intended
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


