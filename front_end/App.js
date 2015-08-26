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
				steal.dev.log('App:', this);

				this.settings = new SettingsCtrl();
				steal.dev.log('App initialized');
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
			, openSettings: function () {
				var self = this;
				$.when($.proxy(this.openWindow, self, 'Settings')).then(function (window) {
					overwolf.windows.changePosition(window.id, self.getCenteredX(window), self.getCenteredY(window));
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
				//self.windows = self.windows || {};
				// TODO: was ist, falls es schon ein window gibt?
				if (self.windows[nameLow]) {
				} // ???
				else {
					self.windows[nameLow] = new WindowCtrl('body#' + name.toLowerCase(), {
						name: name,
						width: 750, // TODO: kann evtl weg wenn über Manifest läuft
						height: 400 // TODO: kann evtl weg wenn über manifest läuft
					});
					$.when(self.windows[nameLow].isWindowSetPromise).then(function (window) {
						self.windows[nameLow].open();
						steal.dev.log(name + ' Window opened: ', window);
						deferred.resolve(window);
					})
				}
				return deferred.promise();
			}
		});
		return App;
	});