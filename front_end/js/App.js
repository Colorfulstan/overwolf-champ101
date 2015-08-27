"use strict";
var Construct = require('can/construct/');
var WindowCtrl = require('./WindowCtrl');

/**
 * An Object containing the "whole" App.
 * Represents the Main crossing point for the components of the app
 * as it initiates and manages the controllers.
 */
var App = Construct.extend({
	init: function () {
		/** All opened overwolf windows stored under their respective Names @type {{ overwolfWindows }} */
		this.windows = {};

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
		if (!win) win = new WindowCtrl('', {name: name});
		self.windows[name] = win;
		$.when(win.open()).then(function (ow_window) {
			var x = self.windows[name].getCenteredX();
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
			var x = self.windows[name].getCenteredX();
			var y = self.windows[name].getCenteredY();
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