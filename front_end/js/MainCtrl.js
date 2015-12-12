"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, function (can
		, /** WindowCtrl */ WindowCtrl
		, /**SettingsModel*/ SettingsModel) {

		var Static = {
			defaults: {
				name: 'Main'
				, matchBtn: '.btn-match'
			},
			mostRecentFPS: [],


			/**
			 * @param {GameInfoChangeData} changeData
			 * @returns {bool} true if a game has been started, according to the given data
			 * @see MainCtrl.registerGameStartListeners method gets called there through overwolf-handlers
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
			 * @see MainCtrl.registerGameStartListeners method gets called there through overwolf-handlers
			 * */
			gameFinished: function (changeData) { // TODO: move all this eventstuff into own service!
				return changeData.gameInfo !== null &&
						changeData.gameInfo.title == "League of Legends" &&
						changeData.runningChanged; // runningchanged indicates that Game just finished
			},
			_notifyWhenFPSStable: function (/** FPSInfo */ result) { // TODO: move all this eventstuff into own service!
				MainCtrl.mostRecentFPS.push(result.Fps);
				steal.dev.log(MainCtrl.mostRecentFPS);
				console.log(MainCtrl.mostRecentFPS);

				if (isFpsNumberStable(MainCtrl.mostRecentFPS, 30, 4)) {
					steal.dev.log('FPS stable with ' + result.Fps + ' triggering fpsStable');
					console.log('FPS stable with ' + result.Fps + ' triggering fpsStable');
					$(WindowCtrl.events).trigger('fpsStable');
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
			addStableFpsListener: function () { // TODO: move all this eventstuff into own service!
				var settings = new SettingsModel();
				settings.isFpsStable('false');
				MainCtrl.mostRecentFPS = [];
				overwolf.benchmarking.onFpsInfoReady.addListener(MainCtrl._notifyWhenFPSStable);
			}

			,
			removeStableFpsListener: function () {// TODO: move all this eventstuff into own service!
				var settings = new SettingsModel();
				settings.isFpsStable('true');
				overwolf.benchmarking.onFpsInfoReady.removeListener(MainCtrl._notifyWhenFPSStable);
			}
			,
			registerFpsStableListener: function () {// TODO: move all this eventstuff into own service!
				$(WindowCtrl.events).on('fpsStable', function () {
					steal.dev.log('fpsStable event');
					console.log('fpsStable event');
					MainCtrl.removeStableFpsListener();
					MainCtrl.mostRecentFPS = [];

					//settings.cachedGameAvailable(true);

					if (!SettingsModel.closeMatchWithGame()) {
						MainCtrl.closeMatch();
						window.setTimeout(function () {
							MainCtrl.openMatch(); // prevents openMatch to be executed before closeMatch()!
						}, 10);
					} else {
						MainCtrl.openMatch();
					}
					//overwolf.benchmarking.stopRequesting(); // MPTE: stopping requesting makes it impossible to start it again until app restarts!?
				});
			},
			_handleGameStart: function (settings) {// TODO: move all this eventstuff into own service!
				steal.dev.warn('League of Legends game started', new Date());
				console.log('League of Legends game started', new Date());
				if (SettingsModel.isSummonerSet()){
					MainCtrl.removeStableFpsListener(); // to prevent unwanted listener-stacking
					MainCtrl.addStableFpsListener();
					settings.isInGame(true);
					WindowCtrl.openMatch();
				} else {
					WindowCtrl.openMain(); // rest is handled from there for first start
				}
			},
			_handleGameEnd: function(settings) {// TODO: move all this eventstuff into own service!
				steal.dev.log('stopping possible fps requests');
				MainCtrl.removeStableFpsListener();
				//settings.cachedGameAvailable(false);
				steal.dev.warn('League of Legends game finished', new Date());
				if (SettingsModel.closeMatchWithGame()) {
					WindowCtrl.closeMatch();
				}
				settings.isInGame(false);
			},
			registerGameStartEndListener: function (settings) {// TODO: move all this eventstuff into own service!
				// NOTE: second point where App determines if player is within a game or not. Other point is in boot.js (at app boot)
				overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
					steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
					if (MainCtrl.gameStarted(result)) { MainCtrl._handleGameStart(settings); }
					if (MainCtrl.gameFinished(result)) { MainCtrl._handleGameEnd(settings); }
				});
			},
			/** Register handlers for window-events here
			 * @memberOf {MainCtrl}
			 * @static*/
			registerGameStartListeners: function (settings) { // TODO: move all this eventstuff into own service!
				var self = this;
				self.registerFpsStableListener();
				self.registerGameStartEndListener(settings);

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
				steal.dev.log('MainCtrl initialized :', this);
			}
			,
			/**
			 *
			 * calls {@link WindowCtrl.openMatch}
			 * @param el
			 * @param ev
			 */
			'{matchBtn} mousedown': function (el, ev) {
				steal.dev.log('WindowCtrl: open match');
				var settings = new SettingsModel;
				settings.startMatchCollapsed(false);
				WindowCtrl.openMatch();
				settings.destroy();
			}
		};

		/**
		 * The WindowController for the main window ( boot.js / main.html )
		 * @class {MainCtrl}
		 * @extends WindowCtrl
		 * @constructor {@link MainCtrl.init}
		 */
		var MainCtrl = WindowCtrl.extend(Static, Instance);
		return MainCtrl;
	})
;