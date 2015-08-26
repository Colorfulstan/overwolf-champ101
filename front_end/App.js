"use strict";
steal('can'
	, './controller/WindowCtrl.js'
	, './controller/SettingsCtrl.js'
	, function (can
		, WindowCtrl
		, SettingsCtrl) {
		/**
		 * An Object containing the "whole" App.
		 * Represents the Main crossing point for the components of the app
		 * as it initiates and manages the controllers.
		 */
		var App = can.Construct.extend({
			init: function () {
				/** All opened overwolf windows stored under their respective Names @type {{ overwolfWindows }} */
				this.windows = {};
				/** The Settings-Controller to access and change Settings within the App @type {SettingsCtrl} */
				this.settings = new SettingsCtrl('div#content');

				steal.dev.log('App initialized :', this);
			}
			, start: function () {
				this.openMainWindow();
			}
			, openMainWindow: function () {
				this.openWindow('Main');
			}
			, openMatchWindow: function () {
				var self = this;
				$.when($.proxy(this.openWindow, self, 'Match')).then(function (window) {
					overwolf.windows.changePosition(window.id, self.getCenteredX(window), self.getCenteredY(window));
				});
			}
			/**
			 * Opens the Settings-Window and creates a new SettingsCtrl stored within this.settings
			 */
			, openSettings: function () {
				var self = this;
				$.when($.proxy(this.openWindow, self, 'Settings')).then($.proxy(function (window) {
					// TODO: should this window open centered even after relocating it? => not position it at all
					overwolf.windows.changePosition(window.id, self.getCenteredX(window), self.getCenteredY(window));
				}), self);
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
				//self.windows = self.windows || {};
				// TODO: was ist, falls es schon ein window gibt?
				if (self.windows[nameLow]) {
				} // ???
				else {
					self.windows[nameLow] = new WindowCtrl('body#' + name.toLowerCase(), {
						name: name
					});
					$.when(self.windows[nameLow].isWindowSetPromise).then(function (window) {
						self.windows[nameLow].open();
						steal.dev.log(name + ' Window opened: ', window, self.windows[name]);
						deferred.resolve(window);
					})
				}
				return deferred.promise();
			}
		});
		return App;
	});