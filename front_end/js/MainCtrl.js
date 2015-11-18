"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, function (can
		, /** WindowCtrl */ WindowCtrl
		, /**SettingsModel*/ SettingsModel) {

		/**
		 * The WindowController for the main window ( main.js / main.html )
		 * @class {MainCtrl}
		 * @extends WindowCtrl
		 * @constructor {@link MainCtrl.init}
		 */
		var MainCtrl = WindowCtrl.extend(
			{
				defaults: {
					name: 'Main'
					, matchBtn: '.btn-match'
				},

				/** Register handlers for window-events here
				 * @memberOf {MainCtrl}
				 * @static*/
				registerOverwolfHandlers: function () {
					var self = this;
					var startMatchWhenFPSStable = function(/** FPSInfo */ result) {
						console.log(result.Fps);
						var settings = new SettingsModel();
						if (result.Fps > 30 && settings.mostRecentFPS() > 30) {
							settings.startMatchCollapsed(true);
							settings.cachedGameAvailable(true);
							self.openMatch();
							steal.dev.log('FPS Info request ends, framerate stable with ' + result.Fps);
							overwolf.benchmarking.onFpsInfoReady.removeListener(startMatchWhenFPSStable);
						} else {
							settings.mostRecentFPS(result.Fps)
						}
					};

					overwolf.windows.onStateChanged.addListener(function (/** WindowStateChangeData */ result) {
						steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
					});
					overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
						steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
					});
					overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
						var settings = new SettingsModel();
						var fpsHandler = $.proxy(startMatchWhenFPSStable, self);
						steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
						if (self.gameStarted(result)) {
							steal.dev.warn('League of Legends game started', new Date());
							// removing it in case game did not finish cleanly
							overwolf.benchmarking.onFpsInfoReady.removeListener(fpsHandler);
							overwolf.benchmarking.onFpsInfoReady.addListener(fpsHandler);
							overwolf.benchmarking.requestFpsInfo(1000, function () { steal.dev.log('FPS Info request starts') })
						}
						if (self.gameFinished(result)) {
							settings.mostRecentFPS(0);
							steal.dev.log('stopping possible fps requests');
							overwolf.benchmarking.onFpsInfoReady.removeListener(fpsHandler);
							settings.cachedGameAvailable(false);
							steal.dev.warn('League of Legends game finished', new Date());
							self.closeMatch()
						}
					});
				},
				/**
				 * @param {GameInfoChangeData} changeData
				 * @returns {bool} true if a game has been started, according to the given data
				 * @see MainCtrl.registerOverwolfHandlers method gets called there through overwolf-handlers
				 * */
				gameStarted: function (changeData) {
					return changeData.gameInfo !== null &&
						changeData.gameInfo.title == "League of Legends" &&
						changeData.gameChanged; // gamechanged indicates that Game just started
				},
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
			},
			{ // Instance
				/** @constructs
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
			});
		return MainCtrl;
	});