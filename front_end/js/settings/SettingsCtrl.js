"use strict";
import can from 'can';
import WindowCtrl from 'WindowCtrl';
import analytics from 'analytics';

/**
 * Controller for the "Settings" view (settings.html / settings.js)
 * @inheritDoc WindowCtrl
 */
var SettingsCtrl = WindowCtrl.extend('SettingsCtrl', {
	defaults: {
		name: 'Settings',
		settingsTmpl: 'templates/settings.mustache',
		loadingSpinnerTmpl: 'templates/parts/loading-spinner.mustache',
		hotkeyBtns: '.hotkey-btn'
	}
}, {
	/**
	 * @param options
	 */
	init: function (options) {
		var self = this;
		WindowCtrl.prototype.init.apply(self, arguments);

		$.when(WindowCtrl.open('Settings')).then(function (/**ODKWindow*/ odkWindow) {
			self.odkWindow = odkWindow;
		});
		self.renderView();
	},
	renderView: function () {
		this.element.find('#content').html(
			can.view(this.options.settingsTmpl, this.options.settings)
		);
		this.element.removeClass('hidden');
	},

	saveAndCloseHandler: function (self, $btn) {
		/**@type {SettingsModel} */
		var settings = self.options.settings;
		self.triggerRestartIfNeccessary(settings.changedPropsOriginalValues['startWithGame'], settings.startWithGame());
		sendAnalytics(settings);
		window.setTimeout(function () {
			self.closeSettings();
		}, 100);
		function sendAnalytics(settings) {

			var action;
			if (settings.hasValueChanged('startWithGame')) {
				action = (settings.constructor.startWithGame()) ? 'enabled' : 'disabled';
				analytics.event('Settings', action, 'startWithGame');
			}
			if (settings.hasValueChanged('closeMatchWithGame')) {
				action = (settings.constructor.closeMatchWithGame()) ? 'enabled' : 'disabled';
				analytics.event('Settings', action, 'closeMatchWithGame');
			}
			if (settings.hasValueChanged('isWaitingForStableFps')) {
				action = (settings.constructor.isWaitingForStableFps()) ? 'enabled' : 'disabled';
				analytics.event('Settings', action, 'waitForStableFpsBeforeOpening');
			}
			action = null;
		}
	},
	triggerRestartIfNeccessary: function (startWithGameOrig, startWithGameCurrent) {
		if (typeof startWithGameOrig !== 'undefined' && startWithGameOrig !== startWithGameCurrent) {
			WindowCtrl.events.trigger('restartAppEv');
		}
	},
	closeSettings: function () {
		var self = this;
		WindowCtrl.events.trigger('settingsClosed');
		window.setTimeout(function () {
			WindowCtrl.close(self.odkWindow.name);
		}, 100);

	},
	'#btn-save-close click': function ($btn, ev) {
		$btn.text('checking'); // TODO: replace with class
		analytics.event('Button', 'click', 'save-settings');
		this.saveAndCloseHandler(this, $btn);
	},
	'.btn-close click': function ($el, ev) {
		var self = this;
		this.options.settings.reset();
		self.closeSettings();
	},
	'.btn-cancel click': function ($el, ev) {
		// restore the old settings-values
		this.options.settings.reset();
		analytics.event('Button', 'click', 'cancel-settings');
		this.closeSettings();
	},
	'#server-region-select change': function ($el, ev) {
		this.options.settings.server($el.val());
	},
	'{hotkeyBtns} click': function ($el, ev) {
		var self = this;
		ev.stopPropagation();

		location.href = 'overwolf://settings/hotkeys#' + $el.attr('id');
		$(document).one('focus', function () {
			WindowCtrl.events.trigger('updateHotkeysEv');
			steal.dev.log('updateHotkeysEv triggered in SettingsCtrl');
			var oldHotkeys = $(SettingsCtrl.defaults.hotkeyBtns);
			$.when(self.options.settings.loadHotKeys()).then(function (nothing) {
				steal.dev.log('hotkeys reloaded');
				self.renderView();
				self.element.find('#hotkeys-rows').show();
				analyticsSendNewHotkey(oldHotkeys, $(SettingsCtrl.defaults.hotkeyBtns));
			});
			function analyticsSendNewHotkey(oldHotkeys, newHotkeys) {
				oldHotkeys.each(function (i) {
					var newValue = $(newHotkeys[i]).attr('data-key');
					var oldValue = $(this).attr('data-key');
					if (oldValue !== newValue) {
						var fields = {};
						fields[analytics.CUSTOM_DIMENSIONS.HOTKEY] = newValue;
						analytics.event('Hotkey', 'changeTo', $(this).attr('id'), fields);
					}
				});
			}
		});
	},
	'#dropdown-hotkeys click': function ($el, ev) {
		ev.stopPropagation();

		if ($('#dropdown-hotkeys').css('display') === 'none') {
			analytics.screenview('Hotkeys');
		}
	}
});
export default SettingsCtrl;