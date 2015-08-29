"use strict";
var Control = require('can/control/');
/**
 * Controller for window-interactions (opening, closing, minimizing, ...)
 * @see WindowCtrl.init
 */
var WindowCtrl = Control.extend({
	/**
	 * @constructor
	 * @param el - CSS Selector for the Element to listen on for events
	 * @param options
	 * @param options.name - Name of the window to open (as specified in Manifest.json)
	 * @param [options.width]
	 * @param [options.height]
	 */
	init: function (el, options) {
		this.SCREEN_WIDTH = window.screen.availWidth;
		this.SCREEN_HEIGHT = window.screen.availHeight;

		this.ow_window = {};
		this.childWindows = {};
		steal.dev.log('WindowCtrl initialized');
	},
	dragResize: function (edge) {
		overwolf.windows.dragResize(this.ow_window.id, edge);
	},
	dragMove: function () {
		overwolf.windows.dragMove(this.ow_window.id);
	},
	close: function () {
		steal.dev.log('close window', this.ow_window);
		overwolf.windows.close(this.ow_window.id);
		this.destroy();
	},
	minimize: function () {
		overwolf.windows.minimize(this.ow_window.id);
	},
	/**
	 * opens the overwolf window of this WindowCtrl.
	 * Returns a promise that gets resolved to the overwolf window object for the opened window.
	 * @function open
	 * @memberOf WindowCtrl
	 * @returns {overwolf-window}
	 */
	open: function () {
		var self = this;
		var deferred = $.Deferred();
		overwolf.windows.obtainDeclaredWindow(self.options.name, $.proxy(function (result) {
			if (result.status == "success") {
				self.ow_window = result.window;
				overwolf.windows.restore(result.window.id, function (result) {
					steal.dev.log('window opened', result);
					debugger;
					if (self.options.width && self.options.height) {

						overwolf.windows.changeSize(self.ow_window.id, self.options.width, self.options.height); // TODO: try through manifest
					}
					deferred.resolve(self.ow_window);
				});
			}
		}, self));
		return deferred.promise();
	},
	getCenteredX: function () {
		var w = this.ow_window.width / 2;
		return parseInt(this.SCREEN_WIDTH / 2 - w);
	},
	getCenteredY: function () {
		var h = this.ow_window.height / 2;
		return parseInt(this.SCREEN_HEIGHT / 2 - h);
	},
	'.drag-window-handle mousedown': function (el, ev) {
		steal.dev.log('dragging');
		this.dragMove();
	},
	'#btn-close click': function (el, ev) {
		this.close();
	},
	'#btn-resize mousedown': function () {
		this.dragResize('BottomRight');
	},
	'#btn-minimize click': function (el, ev) {
		steal.dev.log('minimize window');
		this.minimize();
	},
	'#btn-settings click': function (el, ev) {
		// TODO: how to get this into App??
		var self = this;
		var name = 'Settings';
		var win = self.childWindows[name];
		if (!win) win = new WindowCtrl('', {name: name});
		win.open();
		self.childWindows[name] = win;
		steal.dev.log('opensettings triggered', this.childWindows);
	}
});
module.exports = WindowCtrl;