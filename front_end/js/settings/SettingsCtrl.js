"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');

/**
 * Controller for the "Settings" view (settings.html / settings.js)
 * @inheritDoc WindowCtrl
 */
var SettingsCtrl = WindowCtrl.extend('SettingsCtrl', {
	defaults: {
		name: 'Settings',
		settingsTmpl: 'templates/settings.mustache',
		loadingSpinnerTmpl: 'templates/parts/loading-spinner.mustache'
	}
}, {
	/**
	 * @param options
	 * @param options.settings {SettingsModel} - the SettingsModel object
	 */
	init: function (options) {

		WindowCtrl.prototype.init.apply(this, arguments);
		this.options.oldName = this.options.settings.attr('summonerName');
		this.options.oldServer = this.options.settings.attr('server');


		var self = this;
		$.when(this.constructor.open('Settings', 800, 600)).then(function (ow_window) {
			self.ow_window = ow_window;
		});
		debugger;
		this.element.find('#content').html(
			can.view(this.options.settingsTmpl, this.options.settings)
		);
	},

	'#btn-save-close click': function ($btn, ev) {
		var settings = this.options.settings;
		debugger;
		var self = this;
		$btn.text('checking'); // TODO: replace with class
		if (
			this.options.oldServer == this.options.settings.attr('server')
			&&
			this.options.oldName == this.options.settings.attr('summonerName')
		) {	// no change - spare the request
			debugger;
			this.constructor.close(self.ow_window.name);
			return;
		}
		$.get(
			RIOT_ADAPTER_URL + '/getSummonerId.php'
			, {'server': settings.attr('server'), 'summoner': settings.attr('summonerName')}
			, function (summonerId, status, jqXHR) {
				steal.dev.log('data:', summonerId, 'status:', status, 'jqXHR:', jqXHR);
				settings.attr('summonerId', summonerId);
				self.options.oldName = self.options.settings.attr('summonerName');
				self.options.oldServer = self.options.settings.attr('server');
				debugger;
				self.constructor.close(self.ow_window.name);
			})
			.fail(function (data, status, jqXHR) {
				steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
				//Error.summonerSettings(data.responseText); // TODO
				settings.attr('summonerId', null);
				// TODO: Error message and try again on the button
				// 503 temp unavailable
				// 404 not found
				$btn.text(data.statusText);
			});
	},
	'.btn-close click': function ($el, ev) {
		var self = this;
		window.setTimeout(function () {
			this.constructor.close(self.ow_window.name);
		}, 100);
	},
	'#server-region-select change': function ($el, ev) {
		this.options.settings.attr('server', $el.val());
	},
	'#summoner-name-input change': function ($el, ev) {
		this.options.settings.attr('summonerName', $el.val());
	}
});
module.exports = SettingsCtrl;