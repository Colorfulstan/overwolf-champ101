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
					var settings = new SettingsModel();

					$(MainCtrl).on('fpsStable', function () {
						self.removeMatchStartOnStableFpsListener();
						settings.mostRecentFPS('stable');

						settings.startMatchCollapsed(true);
						settings.cachedGameAvailable(true);
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
							settings.mostRecentFPS(0);
							steal.dev.log('stopping possible fps requests');
							self.removeMatchStartOnStableFpsListener();
							settings.cachedGameAvailable(false);
							steal.dev.warn('League of Legends game finished', new Date());
							self.closeMatch()
						}
					});
				},
				_startMatchWhenFPSStable : function(/** FPSInfo */ result) {
					var settings = new SettingsModel();
					console.log(result.Fps);
					if (result.Fps > 30 && settings.mostRecentFPS() > 30) {
						steal.dev.log('FPS Info request ends, framerate stable with ' + result.Fps);
						$(MainCtrl).trigger('fpsStable');
					} else {
						settings.mostRecentFPS(result.Fps)
					}
				},
				addMatchStartOnStableFpsListener: function(){
					self.constructor.openMatch();
					self.constructor.minimize('Match');
					overwolf.benchmarking.onFpsInfoReady.addListener(MainCtrl._startMatchWhenFPSStable);
				},
				removeMatchStartOnStableFpsListener: function(){
					overwolf.benchmarking.onFpsInfoReady.removeListener(MainCtrl._startMatchWhenFPSStable);
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