"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');
var SettingsModel = require('SettingsModel');

/**
 * An Object containing the "whole" App.
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 */
var MainCtrl = WindowCtrl.extend({
	defaults: {
		name: 'Main'
		, matchBtn: '#btn-match'
		, hideHomeCB: '#hideHome'
		, settingsTmpl: '#settings-tmpl'
	},

	// static
	registerOverwolfHandlers: function () {
		overwolf.windows.onStateChanged.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
		});
		overwolf.windows.onMainWindowRestored.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
		});
		overwolf.games.onGameInfoUpdated.addListener(function (result) {
			steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
			if (this.constructor.gameStarted(result)) {
				steal.dev.warn('League of Legends game started', new Date());
				// TODO: start matchWindow
				this.constructor.openMatch();
			}
			if (this.constructor.gameFinished(result)) {
				steal.dev.warn('League of Legends game finished', new Date());
				// TODO: close Matchwindow
				this.constructor.closeMatch()
			}
		});
	},
	gameStarted: function (result) {
		return result.gameInfo !== null &&
			result.gameInfo.title == "League of Legends" &&
			result.gameChanged;
		// gamechanged indiziert das Game gestartet wurde
	},
	gameFinished: function (result) {
		return result.gameInfo !== null &&
			result.gameInfo.title == "League of Legends" &&
			result.runningChanged;
		// runningchanged indiziert, dass Game beendet wurde
	}
}, { // Instance
	init: function () {
		WindowCtrl.prototype.init.apply(this, arguments);
		//this._super.init();
		/** The overwolf Window for this Window */

		debugger;
		this.element.append(
			can.view(this.options.settingsTmpl, new SettingsModel())
		);

		steal.dev.log('MainCtrl initialized :', this);
	}
	, start: function (isSummonerSet, hideHome) {
		var name = 'Main';
		var self = this;
		if (!hideHome) {
			$.when(WindowCtrl.open(name)).then(function (ow_window) {
				self.ow_window = ow_window;
			});
		}

		if (!isSummonerSet) {
			this.constructor.openSettings();
		}
		this.constructor.openMatch(); // TODO: for debug - remove when finished
	},
	'{matchBtn} click': function (el, ev) {
	steal.dev.log('WindowCtrl: open match');
	this.constructor.openMatch();
}
});
module.exports = MainCtrl;