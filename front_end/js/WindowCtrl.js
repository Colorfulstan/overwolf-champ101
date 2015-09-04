"use strict";
var can = require('can');
/**
 * Controller for window-interactions (opening, closing, minimizing, ...)
 * @static
 * @see WindowCtrl.init
 */
var WindowCtrl = can.Control.extend('WindowCtrl', {
	// static
	SCREEN_WIDTH: window.screen.availWidth,
	SCREEN_HEIGHT: window.screen.availHeight,


	getCenteredX: function (width) {
		return parseInt(WindowCtrl.SCREEN_WIDTH / 2 - width / 2);
	},
	getCenteredY: function (height) {
		return parseInt(WindowCtrl.SCREEN_HEIGHT / 2 - height / 2);
	},
	dragResize: function (name,edge) {
		overwolf.windows.dragResize(name, edge);
	},
	dragMove: function (name) {
		overwolf.windows.dragMove(name);
	},
	minimize: function (name) {
		overwolf.windows.minimize(name);
	},
	/**
	 * opens the overwolf window of this WindowCtrl.
	 * Returns a promise that gets resolved to the overwolf window object for the opened window.
	 * @function open
	 * @memberOf WindowCtrl
	 * @returns {Promise} Promise that resolves into the overwolf-window object
	 */
	open: function (name, width, height) {
		var deferred = $.Deferred();
		overwolf.windows.obtainDeclaredWindow(name, function (result) {
			if (result.status == "success") {
				var ow_window = result.window;
				overwolf.windows.restore(ow_window.id, function (result) {
					steal.dev.log('window opened', result);
					if (width && height) {
						overwolf.windows.changeSize(ow_window.id, width, height); // TODO: try through manifest
					}
					deferred.resolve(ow_window);
				});
			}
		});
		return deferred.promise();
	},
	openHelp: function (name, width, height) {
		// TODO: implement
	},
	openFeedback: function (name, width, height){
		// TODO: implement
	},

	/**
	 * opens the overwolf window of this WindowCtrl.
	 * Returns a promise that gets resolved to the overwolf window object for the opened window.
	 * @function open
	 * @memberOf WindowCtrl
	 * @returns {Promise} Promise that resolves into the overwolf-window object
	 */
	close: function (name) {
		var deferred = $.Deferred();
		overwolf.windows.obtainDeclaredWindow(name, function (result) {
			if (result.status == "success") {
				var ow_window = result.window;
				overwolf.windows.close(ow_window.id, function (result) {
					steal.dev.log('window closed', result);
					deferred.resolve(result);
				});
			}
		});
		return deferred.promise();
	},
	openMatch: function () {
		var width = 750;
		var height = 1000;
		var name = 'Match';
		$.when(WindowCtrl.open(name, width, height)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openMatch: ", ow_window);
			//overwolf.windows.changeSize(ow_window.id, width, height); // TODO: try through manifest
			var x = WindowCtrl.getCenteredX(ow_window.width);
			overwolf.windows.changePosition(ow_window.id, x, 0);
		});
	},
	closeMatch: function(){
		WindowCtrl.close('Match');
	},
	/**
	 * Opens the Settings-Window and creates a new SettingsCtrl stored within this.settings
	 */
	openSettings: function () {
		var name = 'Settings';
		$.when(WindowCtrl.open(name)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openSettings: ", ow_window);
			//	// TODO: should this window open centered even after relocating it? => not position it at all
			var x = WindowCtrl.getCenteredX(ow_window.width);
			var y = WindowCtrl.getCenteredY(ow_window.height);
			overwolf.windows.changePosition(ow_window.id, x, y);
		});
	}
}, { // Instance
	/**
	 * @constructor
	 * @param el - CSS Selector for the Element to listen on for events
	 * @param options
	 * @param options.name - Name of the window to open (as specified in Manifest.json)
	 * @param [options.width]
	 * @param [options.height]
	 */
	init: function (el, options) {

		this.ow_window = {};
		this.childWindows = {};
		steal.dev.log('WindowCtrl initialized for ', options.name);
	}
});
module.exports = WindowCtrl;