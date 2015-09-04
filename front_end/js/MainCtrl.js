"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');

/**
 * An Object containing the "whole" App.
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 */
var MainCtrl = can.Control.extend({
	// static
	registerHotkeys: function () {
		// TODO:
	},
	registerOverwolfHandlers: function () {
		overwolf.windows.onStateChanged.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
			// TODO:
		});
		overwolf.windows.onMainWindowRestored.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onMainWindowRestored:", result);
		});
		overwolf.games.onGameInfoUpdated.addListener(function (result) {
			steal.dev.log('debug', 'MainCtrl - overwolf.games.onGameInfoUpdated:', result);
			if (MainCtrl.gameStarted(result)) {
				steal.dev.warn('League of Legends game started', new Date());
				// TODO: start matchWindow
				WindowCtrl.openMatch();
			}
			if (MainCtrl.gameFinished(result)) {
				steal.dev.warn('League of Legends game finished', new Date());
				// TODO: close Matchwindow
				WindowCtrl.closeMatch()
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
		/** The overwolf Window for this Window */
		this.options.ow_window = null;
		steal.dev.log('MainCtrl initialized :', this);
	}
	, start: function (isSummonerSet) {
		var name = 'Main';
		var self = this;
		$.when(WindowCtrl.open(name)).then(function (ow_window) {
			self.options.ow_window = ow_window;
		});

		if (!isSummonerSet) {
			WindowCtrl.openSettings();
		}
		WindowCtrl.openMatch(); // TODO: for debug - remove when finished
	},

	'.drag-window-handle mousedown': function (el, ev) {
		steal.dev.log('dragging');
		WindowCtrl.dragMove(this.options.ow_window.id);
	},
	'#btn-close click': function (el, ev) {
		WindowCtrl.close(this.options.ow_window.id);
	},
	'#btn-resize mousedown': function () {
		WindowCtrl.dragResize( this.options.ow_window.id, 'BottomRight');
	},
	'#btn-minimize click': function (el, ev) {
		steal.dev.log('minimize window');
		WindowCtrl.minimize(this.options.ow_window.id);
	},
	'#btn-settings click': function (el, ev) {
		steal.dev.log('MainCtrl: open settings');
		WindowCtrl.openSettings();
	}
});
module.exports = MainCtrl;