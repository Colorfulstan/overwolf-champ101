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
		, closeBtn: '.btn-close',

		// handled routes
		toggleWindowRoute: Routes.toggleWindow,
	},
	// static
	SCREEN_WIDTH: window.screen.availWidth,
	SCREEN_HEIGHT: window.screen.availHeight,


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
				self.openMatch();
			}
			if (self.gameFinished(result)) {
				steal.dev.warn('League of Legends game finished', new Date());
				self.closeMatch()
			}
		});
	},

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
					//if (width && height) {
					//	overwolf.windows.changeSize(ow_window.id, width, height); // TODO: try through manifest
					//}
					debugger;
					deferred.resolve(ow_window);
				});
			}
		});
		return deferred.promise();
	},
	/**
	 * Minimizes or restores a window, depending on if it is currently minimized or not.
	 * @param name {String} name of the Window as in the manifest.json
	 * @return {Promise} after the Window got minimized or restored resolving
	 * to the overwolf Window object when window got restored
	 * or into null if it got minimized
	 */
	toggle: function (name) {
		var self = this;
		var deferred = $.Deferred();
		overwolf.windows.obtainDeclaredWindow(name, function (result) {
			if (result.status == "success") {
				if (result.window.isVisible) {
					self.minimize(name);
					deferred.resolve(null);
				} else {
					$.when(self.open(name)).then(function (odkWindow) {
						deferred.resolve(odkWindow);
					}); // TODO: test - is this the same as just restoring it?
				}
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
		var self = this;
		$.when(this.open('Match', width, height)).then(function (ow_window) {
			steal.dev.log("WindowCtrl.openMatch: ", ow_window);
			//overwolf.windows.changeSize(ow_window.id, width, height); // TODO: does it work through manifest on new installation?
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
		var self = this;
		$.when(this.open('Settings')).then(function (ow_window) {
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
	}
	,
	'.whats-this click': function ($el, ev) {
		var $whats = $el.closest('div').find('.whats-this-display');
		if ($whats.length) {
			$whats.remove();
		} else {
			$el.closest('div').append('<div class="whats-this-display text-body">' + $el.attr('title') + '</div>');
		}
	}
	,
	'.drag-window-handle mousedown': function (el, ev) {
		steal.dev.log('dragging');
		this.constructor.dragMove(this.options.name);
	}
	,

	// Eventhandler
	'{closeBtn} mousedown': function (el, ev) {
		this.constructor.close(this.options.name);
		ev.stopPropagation();
	}
	,
	'{resizeBtn} mousedown': function (el, ev) {
		this.constructor.dragResize(this.options.name, 'BottomRight');
		ev.stopPropagation();
	}
	,
	'{minimizeBtn} mousedown': function (el, ev) {
		steal.dev.log('WindowCtrl: minimize window');
		this.constructor.minimize(this.options.name);
		ev.stopPropagation();
	}
	,
	'{settingsBtn} mousedown': function (el, ev) {
		steal.dev.log('WindowCtrl: open settings');
		this.constructor.openSettings();
		ev.stopPropagation();
	}
	,
	'{homeBtn} mousedown': function ($el, ev) {
		this.constructor.open('Main');
		ev.stopPropagation();
	}
	,
	/**
	 * @param routeData.window {String} Name of the Window as in the manifest
	 */
	'{toggleWindowRoute} route': function (routeData) {
		steal.dev.log('toggle/:window - routeData:', routeData);
		this.constructor.toggle(routeData.window);
		can.route.attr({'route': Routes.showPanels});
	}
	//,
	//'{helpBtn} mousedown': function ($el, ev) {
	//	this.constructor.openHelp();
	//	ev.stopPropagation();
	//}
	//,
	//'{feedbackBtn} mousedown': function ($el, ev) {
	//	debugger;
	//	this.constructor.openFeedback();
	//	ev.stopPropagation();
	//}
});
module.exports = WindowCtrl;