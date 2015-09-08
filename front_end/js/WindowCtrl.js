"use strict";
var can = require('can');
var Routes = require('Routes');

/**
 * Controller for window-interactions (opening, closing, minimizing, ...)
 * @static
 * @see WindowCtrl.init
 */
var WindowCtrl = can.Control.extend('WindowCtrl', {

	defaults: {
		 resizeBtn: '.btn-resize'
		, minimizeBtn: '.btn-minimize'
		, settingsBtn: '.btn-settings'
		, homeBtn: '.btn-home'
		, helpBtn: '.btn-help'
		, feedbackBtn: '.btn-feedback'
		, closeBtn: '.btn-close'
	},
	// static
	SCREEN_WIDTH: window.screen.availWidth,
	SCREEN_HEIGHT: window.screen.availHeight,


	getCenteredX: function (width) {
		return parseInt(this.SCREEN_WIDTH / 2 - width / 2);
	},
	getCenteredY: function (height) {
		return parseInt(this.SCREEN_HEIGHT / 2 - height / 2);
	},
	dragResize: function (name, edge) {
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
				debugger;
				overwolf.windows.restore(ow_window.id, function (result) {
					if (width && height) {
						overwolf.windows.changeSize(ow_window.id, width, height); // TODO: try through manifest
					}
					debugger;
					deferred.resolve(ow_window);
				});
			}
		});
		return deferred.promise();
	},
	openHelp: function (name, width, height) {
		// TODO: implement
	},
	openFeedback: function () {
		var name = 'Feedback';
		var self = this;
		$.when(this.open(name, 500, 500)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openFeedback: ", ow_window);
			//	// TODO: should this window open centered even after relocating it? => not position it at all
			debugger;
			var x = self.getCenteredX(ow_window.width);
			var y = self.getCenteredY(ow_window.height);
			overwolf.windows.changePosition(ow_window.id, x, y);
		});
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
		var self = this;
		$.when(this.open(name, width, height)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openMatch: ", ow_window);
			//overwolf.windows.changeSize(ow_window.id, width, height); // TODO: try through manifest
			var x = self.getCenteredX(ow_window.width);
			overwolf.windows.changePosition(ow_window.id, x, 0);
		});
	},
	closeMatch: function () {
		this.close('Match');
	},
	/**
	 * Opens the Settings-Window and creates a new SettingsCtrl stored within this.settings
	 */
	openSettings: function () {
		var name = 'Settings';
		var self = this;
		$.when(this.open(name, 500, 500)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openSettings: ", ow_window);
			//	// TODO: should this window open centered even after relocating it? => not position it at all
			var x = self.getCenteredX(ow_window.width);
			var y = self.getCenteredY(ow_window.height);
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
		steal.dev.log('WindowCtrl initialized for ', options.name);
	},
	'.whats-this click': function ($el, ev) {
		debugger;
		var $whats = $('.whats-this-display');
		if ($whats.length) {
			$whats.remove();
		} else {
			$el.append('<div class="whats-this-display">' + $el.attr('title') + '</div>');
		}
	},
	'.drag-window-handle mousedown': function (el, ev) {
		steal.dev.log('dragging');
		this.constructor.dragMove(this.options.name);
	},
	'{closeBtn} click': function (el, ev) {
		this.constructor.close(this.options.name);
		ev.stopPropagation();
	},
	'{resizeBtn} mousedown': function () {
		this.constructor.dragResize(this.options.name, 'BottomRight');
		ev.stopPropagation();
	},
	'{minimizeBtn} click': function (el, ev) {
		steal.dev.log('WindowCtrl: minimize window');
		this.constructor.minimize(this.options.name);
		ev.stopPropagation();
	},
	'{settingsBtn} click': function (el, ev) {
		steal.dev.log('WindowCtrl: open settings');
		this.constructor.openSettings();
		ev.stopPropagation();
	},
	'{homeBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		this.constructor.open('Main');
		ev.stopPropagation();
	},
	'{helpBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		this.constructor.openHelp();
		ev.stopPropagation();
	},
	'{feedbackBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		debugger;
		this.constructor.openFeedback();
		ev.stopPropagation();
	}
});
module.exports = WindowCtrl;