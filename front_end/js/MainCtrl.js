"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, function (can
		, /** WindowCtrl */ WindowCtrl
		, /**SettingsModel*/ SettingsModel) {

		/**
		 * @class {MainCtrl} MainCtrl
		 * @extends WindowCtrl
		 * @constructor {@link MainCtrl.init}
		 */
		var MainCtrl = WindowCtrl.extend(
			/** @lends MainCtrl */
			{
				defaults: {
					name: 'Main'
					, matchBtn: '.btn-match'
					, hideHomeCB: '#hideHome'
					, settingsTmpl: '#settings-tmpl'
				},
				/** @param {GameInfoChangeData} changeData
				 * @returns {bool} */
				gameStarted: function (changeData) {
					return changeData.gameInfo !== null &&
						changeData.gameInfo.title == "League of Legends" &&
						changeData.gameChanged; // gamechanged indicates that Game just started
				},
				/**
				 * @param {GameInfoChangeData} changeData
				 * @returns {bool}
				 * */
				gameFinished: function (changeData) {
					return changeData.gameInfo !== null &&
						changeData.gameInfo.title == "League of Legends" &&
						changeData.runningChanged; // runningchanged indicates that Game just finished
				}
			},
			/** @lends MainCtrl */
			{ // Instance
				/**
				 * @constructs {MainCtrl}
				 */
				init: function () {
					WindowCtrl.prototype.init.apply(this, arguments);

					debugger;
					this.element.find('#content').append(
						can.view(this.options.settingsTmpl, new SettingsModel())
					);
					steal.dev.log('MainCtrl initialized :', this);
				}
				, start: function (isSummonerSet) {
					var self = this;
					$.when(this.constructor.open('Main')).then(function (/**ODKWindow*/ odkWindow) {
						self.odkWindow = odkWindow;
					});

					if (!isSummonerSet) {
						this.constructor.openSettings();
					}
				},
				'{matchBtn} mousedown': function (el, ev) {
					steal.dev.log('WindowCtrl: open match');
					this.constructor.openMatch(SettingsModel.sideViewEnabled());
				}
			});
		return MainCtrl;
	});