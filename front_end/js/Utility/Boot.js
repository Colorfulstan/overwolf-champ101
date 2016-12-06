"use strict";
import WindowCtrl from 'WindowCtrl';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import analytics from 'analytics';

import {OwIoLolService} from 'ow.io.lol.service'
import {OwSimpleIOPluginService} from 'ow.simpleIOPlugin.service'

/**
 * @class {Boot} Boot
 * @static
 * @readonly
 * @typedef {object} Boot
 * */
var Boot = {
	strap: function (main, /** SettingsModel */ settings, isFirstAppStart) {
		steal.dev.log('starting bootstraping');
		Boot.checkIfGameIsRunning(overwolf.games.getRunningGameInfo, settings.isGameRunning)
			.then(function () {
				return Boot.launchApp(main, settings, isFirstAppStart);
			})
			.fail(function () {
				steal.dev.warn('checkIfGameIsRunning() failed', arguments)
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
		analytics.event('App', 'first-launch');
		settings.firstStartDate(new Date().toISOString());
		return Boot.setDefaultSettings(settings)
			.then(Boot.showSettingsUntilClosed)
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
		if (settings.isGameRunning()) {
			Boot._inGameStart(main, settings);
		} else {
			WindowCtrl.openMain();
			steal.dev.log('starting out of game');
			analytics.event('App', 'start-manual', 'not-ingame');
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
				wasAutoLaunched ? analytics.event('App', 'start-auto', 'ingame') : analytics.event('App', 'start-manual', 'ingame');
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

			Boot.checkIfGameIsRunning(overwolf.games.getRunningGameInfo, settings.isGameRunning)
				.then(function (isGameRunning) {
					if (SettingsModel.isFirstStart()) { // TODO: is this extra check neccessary or can we assume it is not the first start?
						return Boot._firstAppLaunch(main, settings);
					} else {
						return isGameRunning ? Boot._hideMatchLoading(settings) : Boot._showMatchLoading(settings);
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
	showSettingsUntilClosed: function () {
		var def = jQuery.Deferred();
		WindowCtrl.events.one('settingsClosed', function () {
			steal.dev.log('executing settingsClosed Listener in showSettingsUntilClosed');
			def.resolve();
		});
		window.setTimeout(function () {
			//WindowCtrl.minimize('Main');
			WindowCtrl.openSettings();
		}, 100);
		return def.promise();
	},
	/**
	 * @returns {Promise} gets resolved after Summoner is set.<br> gets rejected if Settings-Window is closed and still no summonerId is set
	 * @deprecated summoner is not neccessary anymore to be set manually
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
	checkIfGameIsRunning: function (ow_GetRunningGameInfoFn, isGameRunningSetterFn) {
		steal.dev.log('checking if in game');
		var def = $.Deferred();
		// NOTE: first of two points where app determines if player is within a game
		// other point is through listener (registerOverwolfListener)
		var isGameRunning;
		ow_GetRunningGameInfoFn(function (/** GameInfo */ gameData) {
			isGameRunning = !(gameData == undefined || gameData == null);
			isGameRunningSetterFn(isGameRunning);
			def.resolve(isGameRunning);
		});

		return def.promise();
	},
	openMatchIfIngame: function (main, needsReload) { // TODO: should be called if manually opening the app with option startwithGame disabled
		steal.dev.log('openMatchIfIngame');
		if (SettingsModel.isGameRunning()) {
			const owIoLolService = new OwIoLolService(console, overwolf, new OwSimpleIOPluginService(console))

			owIoLolService.simpleIOPlugin.refreshingPlugin().then(owIoLolService.isReplayOrSpectate.bind(owIoLolService)).then(function (isReplayOrSpectate) {
				if (!isReplayOrSpectate){
					steal.dev.log('game is running, opening match');
					var settings = Settings.getInstance();
					main.constructor.addStableFpsListenerAndHandler(settings.isFpsStable);
					return WindowCtrl.openMatch(needsReload);
				}
			});
		}
		return $.Deferred().reject().promise();
	},
	_checkIfAutoLaunched: function () { // can only be checked within the main-window

		// possible scenarios:
		// app starts thorugh user, Main-window opens => var autoLaunch = location.valueOf().search.indexOf('source=gamelaunchevent') >= 0; equals false
		// app starts through gamelaunch => var autoLaunch = location.valueOf().search.indexOf('source=gamelaunchevent') >= 0;		equals true
		// app ran in background and new game starts => Boot.js will not run again until App is shutdown

		var autoLaunched = location.search.indexOf('source=gamelaunchevent') >= 0;
		return $.Deferred().resolve(autoLaunched).promise();
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
		settings.isWaitingForStableFps(true);
		settings.isFpsStable('true');
		return $.Deferred().resolve().promise();
	}
};
export default Boot;