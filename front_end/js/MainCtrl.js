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
					, hideHomeCB: '#hideHome'
					, settingsTmpl: '#settings-tmpl'
				},

				/** Register handlers for window-events here
				 * @memberOf {MainCtrl}
				 * @static*/
				registerOverwolfHandlers: function () {
					debugger;
					var self = this;
					overwolf.windows.onStateChanged.addListener(function (/** WindowStateChangeData */ result) {
						steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
					});
					overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {
						steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
					});
					overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {
						steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
						if (self.gameStarted(result)) {
							localStorage.setItem('lock_getCachedGame', "1"); // TODO: move into Settings
							steal.dev.warn('League of Legends game started', new Date());
							self.openMatch();
						}
						if (self.gameFinished(result)) {
							localStorage.setItem('lock_getCachedGame', "0"); // TODO: move into Settings
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

					this.element.find('#content').append(
						can.view(this.options.settingsTmpl, new SettingsModel())
					);
					steal.dev.log('MainCtrl initialized :', this);
				}
				,

				/**
				 * Opens the Main Window and SettingsWindow if Summoner is not set
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