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

			/** Register handlers for window-events here
			 * @memberOf {MainCtrl}
			 * @static*/
			registerOverwolfHandlers: function () {
				var self = this;
				var settings = new SettingsModel();

				$(WindowCtrl.events).on('fpsStable', function () {
					steal.dev.log('fpsStable event');
					self.removeMatchStartOnStableFpsListener();
					settings.isFpsStable('true');
					MainCtrl.mostRecentFPS = [];

					settings.startMatchCollapsed(true);
					//settings.cachedGameAvailable(true);

					if (!SettingsModel.closeMatchWithGame()){
						MainCtrl.closeMatch();
					}
					window.setTimeout(function () {
						MainCtrl.openMatch(); // prevents openMatch to be executed before closeMatch()!
					},10);
					//overwolf.benchmarking.stopRequesting(); // MPTE: stopping requesting makes it impossible to start it again until app restarts!?
				});

				overwolf.windows.onStateChanged.addListener(function (/** WindowStateChangeData */ result) {
					steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
				});
				overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
					steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
				});
				overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
					steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
					if (self.gameStarted(result)) {
						steal.dev.warn('League of Legends game started', new Date());
						// removing it in case game did not finish cleanly
						self.removeMatchStartOnStableFpsListener();
						self.addMatchStartOnStableFpsListener();
					}
					if (self.gameFinished(result)) {
						steal.dev.log('stopping possible fps requests');
						self.removeMatchStartOnStableFpsListener();
						//settings.cachedGameAvailable(false);
						steal.dev.warn('League of Legends game finished', new Date());
						if (SettingsModel.closeMatchWithGame()){
							self.closeMatch()
						}
					}
				});
			},
			_startMatchWhenFPSStable: function (/** FPSInfo */ result) {
				MainCtrl.mostRecentFPS.push(result.Fps);
				steal.dev.log(MainCtrl.mostRecentFPS);

				if (isFpsNumberStable(MainCtrl.mostRecentFPS, 30, 4)) {
					steal.dev.log('FPS stable with ' + result.Fps + ' triggering fpsStable');
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
			addMatchStartOnStableFpsListener: function () {
				var settings = new SettingsModel();
				settings.isFpsStable('false');
				MainCtrl.mostRecentFPS = [];
				overwolf.benchmarking.onFpsInfoReady.addListener(MainCtrl._startMatchWhenFPSStable);
			}

			,
			removeMatchStartOnStableFpsListener: function () {
				overwolf.benchmarking.onFpsInfoReady.removeListener(MainCtrl._startMatchWhenFPSStable);
			}
			,

			/**
			 * @param {GameInfoChangeData} changeData
			 * @returns {bool} true if a game has been started, according to the given data
			 * @see MainCtrl.registerOverwolfHandlers method gets called there through overwolf-handlers
			 * */
			gameStarted: function (changeData) {
				return changeData.gameInfo !== null &&
					changeData.gameInfo.title == "League of Legends" &&
					changeData.gameChanged; // gamechanged indicates that Game just started
			}
			,
			/**
			 * @param {GameInfoChangeData} changeData
			 * @returns {bool} true if a game has been finished, according to the given data
			 * @see MainCtrl.registerOverwolfHandlers method gets called there through overwolf-handlers
			 * */
			gameFinished: function (changeData) {
				return changeData.gameInfo !== null &&
					changeData.gameInfo.title == "League of Legends" &&
					changeData.runningChanged; // runningchanged indicates that Game just finished
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
			 * Opens the Main Window and if Summoner is not set also the SettingsWindow
			 * @param isSummonerSet
			 */
			start: function (isSummonerSet) {
				var self = this;
				$.when(this.constructor.open('Main')).then(function (/**ODKWindow*/ odkWindow) {
					self.odkWindow = odkWindow;
				});

				if (!isSummonerSet) {
					this.constructor.openSettings();
				}
			},
			/**
			 *
			 * calls {@link WindowCtrl.openMatch}
			 * @param el
			 * @param ev
			 */
			'{matchBtn} mousedown': function (el, ev) {
				steal.dev.log('WindowCtrl: open match');
				this.constructor.openMatch();
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