"use strict";

import WindowCtrl from 'WindowCtrl';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import Boot from 'Boot';
import analytics from 'analytics';
import $ from 'jquery'
import 'global';

var Static = {
	defaults: {
		name: 'Main'
		, matchBtn: '.btn-match'
	},
	mostRecentFPS: [],
	analytics: analytics, // for testing purposes to be able to mock it


	/**
	 * @param {GameInfoChangeData} changeData
	 * @returns {bool} true if a game has been started, according to the given data
	 * @see MainCtrl.registerGameListeners method gets called there through overwolf-handlers
	 * */
	gameStarted: function (changeData) { // TODO: move all this eventstuff into own service!
		return changeData.gameInfo !== null &&
			changeData.gameInfo.title == "League of Legends" &&
			changeData.gameChanged; // gamechanged indicates that Game just started
	}
	,
	/**
	 * @param {GameInfoChangeData} changeData
	 * @returns {bool} true if a game has been finished, according to the given data
	 * @see MainCtrl.registerGameListeners method gets called there through overwolf-handlers
	 * */
	gameFinished: function (changeData) { // TODO: move all this eventstuff into own service!
		return changeData.gameInfo !== null &&
			changeData.gameInfo.title == "League of Legends" &&
			changeData.runningChanged; // runningchanged indicates that Game just finished
	},
	_notifyWhenFPSStable: function (/** FPSInfo */ result) { // TODO: move all this eventstuff into own service!
		var threshold = 30
			, count = 10
			, recentFps = MainCtrl.mostRecentFPS;

		recentFps.push(result.Fps);
		while (recentFps.length > count) {
			recentFps.shift();
		}
		steal.dev.log(recentFps);

		if (isFpsNumberStable(recentFps, threshold, count)) {
			steal.dev.log('FPS stable with ' + result.Fps + ' triggering fpsStable');
			WindowCtrl.events.trigger('fpsStable');
		}

		/**
		 * Checks if enough numbers are above a threshold
		 * @param {Array.<number>} fpsArray results of fps checks
		 * @param {number} threshold minimum fps to check for as stable
		 * @param {number} countToCheck sample-size to check for stable-fps
		 */
		function isFpsNumberStable(fpsArray, threshold, countToCheck) {
			if (fpsArray.length < countToCheck) {
				return false; // not enough values
			}
			var stable = true;
			var i = fpsArray.length - 1;

			while (stable && countToCheck > 0 && i >= 0) {
				var fps = fpsArray[i];
				stable = (fps >= threshold);

				countToCheck--;
				i--;
			}
			return stable;
		}
	},
	addStableFpsListenerAndHandler: function (isFpsStableSetter) { // TODO: move all this eventstuff into own service!
		MainCtrl.removeStableFpsListener(isFpsStableSetter); // to prevent unnoticed listener-stacking
		isFpsStableSetter('false');
		MainCtrl.registerFpsStableHandler();

		MainCtrl.mostRecentFPS = [];
		overwolf.benchmarking.onFpsInfoReady.addListener(MainCtrl._notifyWhenFPSStable);
		steal.dev.log('stableFPSListener added: ', MainCtrl._notifyWhenFPSStable);

		var func = function () {steal.dev.warn('starting fpsRequest (addStableFpsListenerAndHandler)', arguments)};
		overwolf.benchmarking.requestFpsInfo(100, func);
	}

	,
	removeStableFpsListener: function (isFpsStableSetter) {// TODO: move all this eventstuff into own service!
		isFpsStableSetter('true');
		overwolf.benchmarking.onFpsInfoReady.removeListener(MainCtrl._notifyWhenFPSStable);
		steal.dev.log('stableFPSListener removed: ', MainCtrl._notifyWhenFPSStable);

		//steal.dev.warn('stopping possible fps requests (removeStableFpsListener)');
		//overwolf.benchmarking.stopRequesting();
		// NOTE: curently (overwolf 0.91) stops every possibility to start requesting again
		// when adding onFpsInfoReady listener and benchmarking.requestFpsInfo() again,
		// the listener will not get executed
	}
	,
	registerFpsStableHandler: function () {// TODO: move all this eventstuff into own service!
		steal.dev.log('stableFPSHandler added');
		WindowCtrl.events.one('fpsStable', function () {
			steal.dev.warn('fps Stable, Match should now open');
			var settings = Settings.getInstance();
			MainCtrl.removeStableFpsListener(settings.isFpsStable);
			MainCtrl.mostRecentFPS = [];

			//settings.cachedGameAvailable(true);

			//MainCtrl.openMatch(); // TODO: could be moved elsewhere or removed from elsewhere
			//overwolf.benchmarking.stopRequesting(); // MPTE: stopping requesting makes it impossible to start it again until app restarts!?
		});
	},
	_handleGameStart: function (settings) {// TODO: move all this eventstuff into own service!
		steal.dev.warn('League of Legends game started', new Date(), 'closing Matchwindow for reopening');

		MainCtrl.addStableFpsListenerAndHandler(settings.isFpsStable);
		settings.isGameRunning(true);
		settings.startMatchCollapsed(true);
		WindowCtrl.openMatch();
		steal.dev.warn('opened Match again, waiting for stable fps');

	},
	_handleGameEnd: function (settings) {// TODO: move all this eventstuff into own service!
		MainCtrl.removeStableFpsListener(settings.isFpsStable);
		//settings.cachedGameAvailable(false);
		steal.dev.warn('League of Legends game finished', new Date());
		settings.isGameRunning(false);
		settings.startMatchCollapsed(false);
		WindowCtrl.events.trigger('gameEnded');
		if (SettingsModel.closeMatchWithGame()) {
			WindowCtrl.closeMatch();
			WindowCtrl.closeApp();
		}
	},
	registerGameStartEndListener: function (settings) {// TODO: move all this eventstuff into own service!
		MainCtrl.registerGameStartListenerAndHandler(settings);
		MainCtrl.registerGameEndListenerAndHandler(settings);
	},
	registerGameStartListenerAndHandler: function (settings) {// TODO: move all this eventstuff into own service!
		steal.dev.log('registering GameStartListener');
		// NOTE: second point where App determines if player is within a game or not. Other point is in Boot.js (at app boot)
		overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
			steal.dev.log('debug', 'MainCtrl - registerGameStartListenerAndHandler - overwolf.games.onGameInfoUpdated:', result);
			if (MainCtrl.gameStarted(result)) {
				// to get the match reloading
				MainCtrl.closeMatch().then(function () {
					MainCtrl._handleGameStart(settings);
				});
			}
		});
	},
	registerGameEndListenerAndHandler: function (settings) {// TODO: move all this eventstuff into own service!
		steal.dev.log('registering GameEndListener');

		// NOTE: second point where App determines if player is within a game or not. Other point is in Boot.js (at app boot)
		overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
			steal.dev.log('debug', 'MainCtrl - registerGameEndListenerAndHandler - overwolf.games.onGameInfoUpdated:', result);
			if (MainCtrl.gameFinished(result)) { MainCtrl._handleGameEnd(settings); }
		});
	}
	,
	/** Register handlers for window-events here
	 * @memberOf {MainCtrl}
	 * @static*/
	registerGameListeners: function (settings) { // TODO: move all this eventstuff into own service!
		MainCtrl.registerGameStartEndListener(settings);

		overwolf.windows.onStateChanged.addListener(function (/** WindowStateChangeData */ result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
		});
		overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
		});
	}
};
var Instance = { // Instance
	/** @constructs MainCtrl
	 * @see MainCtrl.start opening of the Window separated into start() to enable more detailed control over the start of the app */
	init: function () {
		WindowCtrl.prototype.init.apply(this, arguments);
		var self = this;
		this.options.version.then(function (v) {
			self.element.find('#version').html(
				'v' + v
			);
		});

		$.get(CHANGELOG_URL).then(function (data) {
			self.element.find('#changelog').html(data);
		}).fail(
			function () {
				steal.dev.log('Could not get changelog', arguments);
				self.element.find('#changelog').html('could not receive changelog');
			}
		);

		steal.dev.log('MainCtrl initialized :', this);
		WindowCtrl.events.one('restartAppEv', function () {
			steal.dev.warn('restarting App by reloading Main-Window');
			location.reload();
		});
	}
	,
	/**
	 *
	 * calls {@link WindowCtrl.openMatch}
	 * @param el
	 * @param ev
	 */
	'{matchBtn} mousedown': function (el, ev) {
		//var self = this;
		steal.dev.log('WindowCtrl: open match');
		var settings = Settings.getInstance();
		Boot._showMatchLoading(settings).then(function () {
			return WindowCtrl.openMatch(true);
		}).then(function () {
			//if (!SettingsModel.startWithGame()) {
			//	Boot._showMatchLoading(settings)
			//			.then(function () { Boot.openMatchIfIngame(self, true); })
			//			.fail(function () { // === not in a game and matchwindow waits for stable fps
			WindowCtrl.events.trigger('fpsStable');
			//});
			//} else { // just open the damn thing
			//}
		});
		analytics.event('Button', 'click', 'Match');
	},
	'.issues-link click': function () {
		analytics.event('ExtLink', 'click', 'Github-issues');
	},
	'.email-link click': function () {
		analytics.event('ExtLink', 'click', 'Email');
	}
};

/**
 * The WindowController for the main window ( main.js / main.html )
 * @class {MainCtrl}
 * @extends WindowCtrl
 * @constructor {@link MainCtrl.init}
 */
var MainCtrl = WindowCtrl.extend(Static, Instance);
export default MainCtrl;