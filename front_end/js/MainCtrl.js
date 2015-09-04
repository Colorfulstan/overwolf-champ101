"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');
var SettingsModel = require('SettingsModel');

/**
 * An Object containing the "whole" App.
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 */
var MainCtrl = can.Control.extend({
	defaults: {
		name: 'Main'
		,closeBtn: '#btn-close'
		, resizeBtn: '#btn-resize'
		, minimizeBtn: '#btn-minimize'
		, settingsBtn: '#btn-settings'
		, matchBtn: '#btn-match'
		, hideHomeCB: '#hideHome'

		, settingsTmpl: '#settings-tmpl'
	},

	// static
	registerHotkeys: function () {
		// TODO:
	},
	registerOverwolfHandlers: function () {
		overwolf.windows.onStateChanged.addListener(function (result) {
			steal.dev.log('debug', "MainCtrl - overwolf.windows.onStateChanged:", result);
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

		debugger;
		this.element.append(
			can.view(this.options.settingsTmpl, new SettingsModel())
		);

		steal.dev.log('MainCtrl initialized :', this);
	}
	, start: function (isSummonerSet, hideHome) {
		var name = 'Main';
		var self = this;
		if (!hideHome){
			$.when(WindowCtrl.open(name)).then(function (ow_window) {
				self.options.ow_window = ow_window;
			});
		}

		if (!isSummonerSet) {
			WindowCtrl.openSettings();
		}
		WindowCtrl.openMatch(); // TODO: for debug - remove when finished
	},

	'.drag-window-handle mousedown': function (el, ev) {
		steal.dev.log('dragging');
		WindowCtrl.dragMove(this.options.name);
	},
	'{closeBtn} click': function (el, ev) {
		WindowCtrl.close(this.options.name);
	},
	'{resizeBtn} mousedown': function () {
		WindowCtrl.dragResize(this.options.name, 'BottomRight');
	},
	'{minimizeBtn} click': function (el, ev) {
		steal.dev.log('minimize window');
		WindowCtrl.minimize(this.options.name);
	},
	'{settingsBtn} click': function (el, ev) {
		steal.dev.log('MainCtrl: open settings');
		WindowCtrl.openSettings();
	},
	'{matchBtn} click': function (el, ev) {
		steal.dev.log('MainCtrl: open match');
		WindowCtrl.openMatch();
	}
});
module.exports = MainCtrl;