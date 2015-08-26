"use strict";
steal('can/control', function (Control) {
	/**
	 * Controller for window-interactions (opening, closing, minimizing, ...)
	 */
	var WindowCtrl = Control({
		init: function (el, options) {
			this.SCREEN_WIDTH = window.screen.availWidth;
			this.SCREEN_HEIGHT = window.screen.availHeight;

			this.childWindows = [];

			if (options.name) {
				try {
					this.options.isWindowSetPromise = this.setOverwolfWindow(options.name);
				} catch (e) {
					console.error(e);
				}
			}
			steal.dev.log('WindowCtrl initialized');
		},
		setOverwolfWindow: function (name) {
			var deferred = $.Deferred();
			var self = this;
			overwolf.windows.obtainDeclaredWindow(name, function (result) {
				if (result.status == "success") {
					self.ow_window = result.window;
					deferred.resolve(result.window);
					steal.dev.log('ow_window set for WindowCtrl ' + name, self.ow_window);
				}
			});
			return deferred.promise();
		},

		dragResize: function (edge) {
			overwolf.windows.dragResize(this.ow_window.id, edge);
		} // TODO: remove this functionality?
		, dragMove: function () {
			overwolf.windows.dragMove(this.ow_window.id);
		}
		, close: function () {
			overwolf.windows.close(this.ow_window.id);
			this.destroy();
		}
		, minimize: function () {
			overwolf.windows.minimize(this.ow_window.id);
		}
		, open: function () {
			var self = this;
			steal.dev.log(this.options.isWindowSetPromise);
			$.when(this.options.isWindowSetPromise)
				.then(function () {
					overwolf.windows.restore(self.ow_window.id, function () { });
					if (self.options.width && self.options.height){
						overwolf.windows.changeSize(self.ow_window.id, self.options.width, self.options.height); // TODO: try through manifest
					}
				});
		}
		, getCenteredX: function () {
			var w = this.ow_window.width / 2;
			return this.SCREEN_WIDTH / 2 - w;
		}
		, getCenteredY: function () {
			var h = this.ow_window.height / 2;
			return this.SCREEN_HEIGHT / 2 - h;
		}

		, 'mousedown': function (el, ev) {
			steal.dev.log('dragging');
			this.dragMove();
		}
		, '#btn-close click': function (el, ev) {
			steal.dev.log('close window');
			this.close();
		}
		, '#btn-minimize click': function (el, ev) {
			steal.dev.log('minimize window');
			this.minimize();
		}
		, '#btn-settings click': function (el, ev) {
			// TODO: how to get this into App??
			var self = this;
			var win = new WindowCtrl('Settings', {name:'Settings'});
			$.when(win.options.isWindowSetPromise).then(function () {
				self.childWindows.push(win);
			});
			win.open();
			steal.dev.log('opensettings triggered');
		}
	});

	return WindowCtrl;
});