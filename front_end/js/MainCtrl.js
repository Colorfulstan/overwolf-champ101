"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');
var SettingsModel = require('SettingsModel');

/**
 * An Object containing the "Main" view. (main.html / main.js)
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 * @inheritDoc WindowCtrl
 */
var MainCtrl = WindowCtrl.extend({
	defaults: {
		name: 'Main'
		, matchBtn: '.btn-match'
		, hideHomeCB: '#hideHome'
		, settingsTmpl: '#settings-tmpl'
	},

	// static
	registerOverwolfHandlers: function () {
		var self = this;
		overwolf.windows.onStateChanged.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
		});
		overwolf.windows.onMainWindowRestored.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
		});
		overwolf.games.onGameInfoUpdated.addListener(function (result) {
			steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
			if (self.gameStarted(result)) {
				steal.dev.warn('League of Legends game started', new Date());
				// TODO: start matchWindow
				self.openMatch();
			}
			if (self.gameFinished(result)) {
				steal.dev.warn('League of Legends game finished', new Date());
				// TODO: close Matchwindow
				self.closeMatch()
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

		debugger;
		this.element.find('#content').append(
			can.view(this.options.settingsTmpl, new SettingsModel())
		);

		steal.dev.log('MainCtrl initialized :', this);
	}
	, start: function (isSummonerSet, hideHome) {
		var name = 'Main';
		var self = this;
		if (!hideHome) {
			$.when(this.constructor.open(name)).then(function (ow_window) {
				self.ow_window = ow_window;
			});
		}

		if (!isSummonerSet) {
			this.constructor.openSettings();
		}
		this.constructor.openMatch(); // TODO: for debug - remove when finished
	},
	'{matchBtn} mousedown': function (el, ev) {
	steal.dev.log('WindowCtrl: open match');
	this.constructor.openMatch();
}
});
module.exports = MainCtrl;