"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, 'SettingsProvider.js'
	, function (/**can*/ can
		, /** WindowCtrl */ WindowCtrl
		, /** SettingsModel*/ SettingsModel
		, /**SettingsProvider*/ Settings) {
		/**
		 * @class {Boot} Boot
		 * @static
		 * @readonly
		 * @typedef {Object} Boot
		 * */
		var Boot = {
			strap: function (main, /** SettingsModel */ settings, isFirstAppStart) {
				steal.dev.log('starting bootstraping');
				Boot.checkIfIngame(overwolf.games.getRunningGameInfo, settings.isInGame)
					.then(function () {
						return Boot.launchApp(main, settings, isFirstAppStart);
					})
					.fail(function () {
						steal.dev.warn(arguments)
					});
			},
			launchApp: function (main, settings, isFirstStart, promiseData) {
				steal.dev.log('launching App');
				var registerFns = {
					startEnd: main.constructor.registerGameListeners,
					start: main.constructor.registerGameStartListenerAndHandler,
					end: main.constructor.registerGameEndListenerAndHandler
				};

				if (isFirstStart) {
					return Boot._firstAppLaunch(main, settings)
						.always(function () {
							return Boot._registerAppListeners(main, settings, registerFns);
						})
						.fail(function () {
							steal.dev.warn(arguments)
						});
				} else {
					return Boot._registerAppListeners(main, settings, registerFns)
						.then(function () {
							return Boot._regularLaunch(main, settings);
						})
						.fail(function () {
							steal.dev.warn(arguments)
						});
				}
			},
			_firstAppLaunch: function (main, settings) {
				steal.dev.log('first time launch');
				return Boot.setDefaultSettings(settings)
					.then(function () {
						return Boot.askForSummoner(SettingsModel.isSummonerSet);
					})
					.then(function () {
						return Boot._showMatchLoading(settings);
					})
					.then(function () {
						Boot.openMatchIfIngame(main);
					})
					.always(WindowCtrl.openMain)
					.fail(function () {
						steal.dev.warn(arguments)
					});
			},
			_regularLaunch: function (main, settings) {
				//settings.cachedGameAvailable(false);
				//settings.cachedGameId(null);
				if (settings.isInGame()) {
					Boot._inGameStart(main, settings);
				} else {
					WindowCtrl.openMain();
					steal.dev.log('starting out of game');
				}
			},
			_inGameStart: function (main, settings) {
				// NOTE: only case in which _inGameStart won't be automatic through overwolf is, if overwolf gets started after the match already started!
				Boot._checkIfAutoLaunched()
					.then(function (wasAutoLaunched) {
						if (wasAutoLaunched && !SettingsModel.startWithGame()) {
							return false; // App should not start automatically
						}
						wasAutoLaunched ? Boot._hideMatchLoading(settings) : Boot._showMatchLoading(settings);
						Boot.openMatchIfIngame(main);
					});
			},

			/**
			 * @typedef {function} GameEventRegisterFn
			 * @param {SettingsModel} settings
			 */
			/**
			 * @typedef {object} RegisterFnObj
			 * @property {GameEventRegisterFn} startEnd function to register Game Start and End Listener and Handler
			 * @property {GameEventRegisterFn} start function to register GameStart Listener and Handler
			 * @property {GameEventRegisterFn} end function to register GameEnd Listener and Handler
			 */
			/**
			 * @param main
			 * @param settings
			 * @param {RegisterFnObj} registerFnObj
			 * @param data
			 * @returns {*}
			 * @private
			 */
			_registerAppListeners: function (main, settings, registerFnObj, data) {
				steal.dev.log('registering App Listeners');
				if (SettingsModel.startWithGame() && SettingsModel.closeMatchWithGame()) { // start and close app with game
					if (typeof registerFnObj.startEnd === 'undefined') { throw new Error('registerFnObj.startEnd is missing');}
					registerFnObj.startEnd(settings);
				} else if (SettingsModel.startWithGame()) { // start app with game
					if (typeof registerFnObj.end === 'undefined') { throw new Error('registerFnObj.end is missing');}
					registerFnObj.start(settings);
				} else if (SettingsModel.closeMatchWithGame()) { // close app with game
					if (typeof registerFnObj.end === 'undefined') { throw new Error('registerFnObj.end is missing');}
					registerFnObj.end(settings);
				}

				Boot._registerMainWindowRestoredListeners(main, settings);

				return $.Deferred().resolve().promise();
			},
			_registerMainWindowRestoredListeners: function (main, settings) {
				// TODO: this should still work with "startWithGame" disabled
				steal.dev.log('registering MainWindowRestored Listeners');

				// in case app started previous and gets reopened by user
				overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) { // each time Main-Window gets opened (app manually started)
					steal.dev.log('triggering MainWindowRestored Listener');

					Boot.checkIfIngame(overwolf.games.getRunningGameInfo, settings.isInGame)
						.then(function (isIngame) {
							if (SettingsModel.isSummonerSet()) {
								return isIngame ? Boot._hideMatchLoading(settings) : Boot._showMatchLoading(settings);
							} else {
								return Boot._firstAppLaunch(main, settings);
							}
						}).done(function () {
							var needsReload = !SettingsModel.startWithGame();
							Boot.openMatchIfIngame(main, needsReload);
						})
						.fail(function () {
							steal.dev.warn('then() chain in _registerMainWindowRestoredListeners failed', arguments)
						});
				});
			},
			/**
			 * @returns {Promise} gets resolved after Summoner is set.<br> gets rejected if Settings-Window is closed and still no summonerId is set
			 */
			askForSummoner: function (/** function */ isSummonerSetGetter) {
				var def = jQuery.Deferred();
				WindowCtrl.events.one('settingsClosed', function () {
					steal.dev.log('executing settingsClosed Listener in askForSummoner');
					if (isSummonerSetGetter()) {
						steal.dev.warn(arguments);
						def.resolve();
					} else {
						steal.dev.warn(arguments);
						def.reject();
					}
				});
				window.setTimeout(function () {
					WindowCtrl.minimize('Main');
					WindowCtrl.openSettings();
				}, 100);
				return def.promise();
			},
			checkIfIngame: function (ow_GetRunningGameInfoFn, isInGameSetterFn) {
				steal.dev.log('checking if in game');
				var def = $.Deferred();
				// NOTE: first of two points where app determines if player is within a game
				// other point is through listener (registerOverwolfListener)
				var isInGame;
				ow_GetRunningGameInfoFn(function (/** GameInfo */ gameData) {
					isInGame = !(gameData == undefined || gameData == null);
					isInGameSetterFn(isInGame);
					def.resolve(isInGame);
				});

				return def.promise();
			},
			openMatchIfIngame: function (main, needsReload) { // TODO: should be called if manually opening the app with option startwithGame disabled
				steal.dev.log('openMatchIfIngame');
				if (SettingsModel.isInGame()) {
					steal.dev.log('is in game, opening match');
					var settings = Settings.getInstance();
					main.constructor.addStableFpsListenerAndHandler(settings.isFpsStable);
					return WindowCtrl.openMatch(needsReload);
				}
				return $.Deferred().reject().promise();
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
				steal.dev.warn('setting loading to be shown');
				settings.isManualReloading(true);
				settings.startMatchCollapsed(false);
				return $.Deferred().resolve().promise();
			},
			_hideMatchLoading: function (settings, data) {
				settings.isManualReloading(false);
				settings.startMatchCollapsed(true);
				return $.Deferred().resolve().promise();
			},
			setDefaultSettings: function (settings) {
				settings.startWithGame(true);
				settings.closeMatchWithGame(true);
				settings.isFpsStable('true');
				return $.Deferred().resolve().promise();
			}
		};
		return Boot;
	});