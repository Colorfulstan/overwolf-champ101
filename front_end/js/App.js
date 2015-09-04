"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');

/**
 * An Object containing the "whole" App.
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 */
var App = can.Construct.extend({

	registerHotkeys: function () {
		// TODO:
	},
	registerOverwolfHandlers: function () {
		overwolf.windows.onStateChanged.addListener(function (result) {
			steal.dev.log('debug', "App - overwolf.windows.onStateChanged:", result);
			// TODO:
		});
		overwolf.windows.onMainWindowRestored.addListener(function (result) {
			steal.dev.log('debug', "App - overwolf.windows.onMainWindowRestored:", result);
		});
		overwolf.games.onGameInfoUpdated.addListener(function (result) {
			steal.dev.log('debug', 'App - overwolf.games.onGameInfoUpdated:', result);
			if (App.gameStarted(result)) {
				steal.dev.warn('League of Legends game started', new Date());
				// TODO: start matchWindow
			}
			if (App.gameFinished(result)) {
				steal.dev.warn('League of Legends game finished', new Date());
				// TODO: close Matchwindow
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

}, {
	init: function () {
		/** All opened overwolf windows stored under their respective Names @type {{ overwolfWindows }} */
		this.windows = {};

		App.registerHotkeys();
		App.registerOverwolfHandlers();

		steal.dev.log('App initialized :', this);
	}
	, start: function (isSummonerSet) {
		this.openMainWindow();
		if (!isSummonerSet) {
			this.openSettings();
		}
		this.openMatch(); // TODO: for debug - remove when finished
	}
	, openMainWindow: function () {
		this.openWindow('Main');
	}
	, openMatch: function () {
		var self = this;
		var name = 'Match';
		var win = self.windows[name];
		if (!win) win = new WindowCtrl('', {name: name, width: 750, height: 1000});
		self.windows[name] = win;
		$.when(win.open()).then(function (ow_window) {

			overwolf.windows.changeSize(ow_window.id, win.options.width, win.options.height); // TODO: try through manifest
			var x = WindowCtrl.getCenteredX(ow_window.width);
			overwolf.windows.changePosition(ow_window.id, x, 0);
		});
	}
	/**
	 * Opens the Settings-Window and creates a new SettingsCtrl stored within this.settings
	 */
	, openSettings: function () {
		var self = this;
		var name = 'Settings';
		var win = self.windows[name];
		if (!win) win = new WindowCtrl('', {name: name});
		win.open();
		self.windows[name] = win;
		$.when(win.open()).then(function (ow_window) {
			//	// TODO: should this window open centered even after relocating it? => not position it at all
			var x = WindowCtrl.getCenteredX(self.windows[name].width);
			var y = WindowCtrl.getCenteredY(self.windows[name].height);
			overwolf.windows.changePosition(ow_window.id, x, y);
		});
	}
	/**
	 * Opens a Window with the given Name (Capital-case)
	 *
	 * Window gets stored within this.window[name]
	 *
	 * @param name - Name of the Window in the overwolf Manifest.json
	 * becomes the name of the opened WindowCtrl object and
	 * @returns promise that gets resolved with the overwolf-window Object after the Window gets opened
	 */
	, openWindow: function (name) {
		var deferred = $.Deferred();
		var self = this;
		var nameLow = name.toLowerCase();
		// TODO: was ist, falls es schon ein window gibt?
		if (self.windows[name] == undefined) {
			self.windows[name] = new WindowCtrl('body#' + name.toLowerCase(), {
				name: name
			});
		}
		$.when(self.windows[name].open()).then(function (window) {
			steal.dev.log(name + ' Window opened: ', window, self.windows[name]);
			deferred.resolve(window);
		});
		return deferred.promise();
	}
});
module.exports = App;