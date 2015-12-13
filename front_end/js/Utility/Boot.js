"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'MainCtrl.js'
	, 'SettingsModel.js'
	, function (/**can*/ can
		, /** WindowCtrl */ WindowCtrl
		, /** MainCtrl */ MainCtrl
		, /** SettingsModel*/ SettingsModel) {
		/**
		 * @class {Boot} Boot
		 * @static
		 * @readonly
		 * @typedef {Object} Boot
		 * */
		var Boot = {
			strap: function (isFirstAppStart, /** SettingsModel */ settings) {
				Boot.checkIfIngame(overwolf.games.getRunningGameInfo, settings.isInGame)
					.then(Boot.launchApp.bind(null, settings, isFirstAppStart))
					.fail(console.error);
			},
			setDefaultSettings: function (settings) {
				settings.startWithGame(true);
				settings.closeMatchWithGame(true);
				settings.isFpsStable('true');
				return $.Deferred().resolve().promise();
			},
			/**
			 * @returns {Promise} gets resolved after Summoner is set.<br> gets rejected if Settings-Window is closed and still no summonerId is set
			 */
			askForSummoner: function () {
				var def = $.Deferred();
				WindowCtrl.openSettings();
				WindowCtrl.events.one('settingsClosed', function () {
					if (SettingsModel.isSummonerSet()) {
						def.resolve();
					} else {
						def.reject();
					}
				});
				return def.promise();
			},
			checkIfIngame: function (ow_GetRunningGameInfoFn, isInGameSetterFn) {
				var def = $.Deferred();
				// NOTE: first of two points where app determines if player is within a game
				// other point is through listener (registerOverwolfListener)
				var isInGame;
				ow_GetRunningGameInfoFn(function (deferred, /** GameInfo */ gameData) {
					isInGame = !(gameData == undefined || gameData == null);
					isInGameSetterFn(isInGame);
					def.resolve(isInGame);
				});

				return def.promise();
			},
			openMatchIfIngame: function () {
				if (SettingsModel.isInGame()) {
					MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
					MainCtrl.addStableFpsListener();
					overwolf.benchmarking.requestFpsInfo(250, function () {});
					return WindowCtrl.openMatch();
				}
				return $.Deferred().reject().promise();
			},
			launchApp: function (settings, isFirstStart, promiseData) {
				if (isFirstStart) {
					return Boot._firstAppLaunch(settings)
						.always(Boot._registerAppListeners.bind(null, settings));
				} else {
					Boot._regularLaunch(settings);
					return $.Deferred().resolve().promise();
				}
			},
			_firstAppLaunch: function (settings) {
				return Boot.setDefaultSettings(settings)
					.then(Boot.askForSummoner)
					.then(Boot._showMatchLoading.bind(null, settings))
					.then(Boot.openMatchIfIngame)
					.always(WindowCtrl.openMain)
					.fail(window.console.error);
			},
			_regularLaunch: function (settings) {
				Boot._registerAppListeners(settings);

				//settings.cachedGameAvailable(false);
				//settings.cachedGameId(null);
				if (settings.isInGame()) {
					Boot._inGameStart(settings);
				} else {
					Boot._outOfGameStart(settings, overwolf.benchmarking.requestFpsInfo); // TODO: make asynch
				}
			},

			_outOfGameStart: function (settings, /** function */ ow_requestFpsInfo) {
				settings.startMatchCollapsed(false);
				WindowCtrl.openMain();
				var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
				ow_requestFpsInfo(250, func);
			},
			_inGameStart: function (settings) {
				// NOTE: only case in which _inGameStart won't be automatic through overwolf is, if overwolf gets started after the match already started!
				Boot._checkIfAutoLaunched()
					.then(function (wasAutoLaunched) {
						if (wasAutoLaunched && !SettingsModel.startWithGame()) {
							return false; // App should not start automatically
						}
						wasAutoLaunched ? Boot._hideMatchLoading(settings) : Boot._showMatchLoading(settings);
						MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
						MainCtrl.addStableFpsListener();
						var func = function () { steal.dev.log('FPS Info request starts') }; // build bugs if this is inlined
						overwolf.benchmarking.requestFpsInfo(250, func);
						WindowCtrl.openMatch();
					});
			},
			_checkIfAutoLaunched: function () { // TODO: not sure if this works as intended // and only usable if checked for ingame before
				// if app is started manually, the main-window will open anyways.
				// So if that window is not present, the game was started through auto-launch
				// TODO: change main-window to some kind of indicator-window so that main-window don't have to open when app gets started manually

				// TODO: add check for ingame here and then make public
				var def = $.Deferred();
				WindowCtrl.isWindowVisible('Main').then(function (isVisible) {
					if (!isVisible) steal.dev.warn('App started through overwolf');
					def.resolve(!isVisible);
				});
				return def.promise();
			},
			_showMatchLoading: function (settings, data) {
				settings.isManualReloading(true);
				settings.startMatchCollapsed(false);
				return $.Deferred().resolve().promise();
			},
			_hideMatchLoading: function (settings, data) {
				settings.isManualReloading(false);
				settings.startMatchCollapsed(true);
				return $.Deferred().resolve().promise();
			},

			_registerAppListeners: function (settings, data) {
				if (SettingsModel.startWithGame()) {
					MainCtrl.registerGameStartListeners(settings);
				}

				// in case app started previous and gets reopened by user
				overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) { // each time Main-Window gets opened (app manually started)
					Boot.checkIfIngame(overwolf.games.getRunningGameInfo, settings.isInGame)
						.then(function () {
							var def = $.Deferred();
							SettingsModel.isSummonerSet() ? def.resolve() : def.reject();
							return def.promise();
						}).then(Boot._showMatchLoading.bind(null, settings))
						.done(Boot.openMatchIfIngame)
						.fail(Boot._firstAppLaunch.bind(null, settings))
						.fail(console.error);
				});
				return $.Deferred().resolve().promise();
			}
		};
		return Boot;
	});