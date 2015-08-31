"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');

/**
 * Controller for the "Settings" view
 */
var SettingsCtrl = can.Control.extend('SettingsCtrl', {
	defaults: {
		settingsTmpl: 'templates/settings.mustache'
	}
}, {
	/**
	 * @param options
	 * @param options.settings {SettingsModel} - the SettingsModel object
	 */
	init: function (options) {

		this.options.oldName = this.options.settings.attr('summonerName');
		this.options.oldServer = this.options.settings.attr('server');
		debugger;
		this.window = new WindowCtrl('body#settings', {name: 'Settings'});
		this.window.open();

		this.element.html(
			can.view(this.options.settingsTmpl, this.options.settings)
		);
	},

	'#btn-save-close click': function ($btn, ev) {
		var settings = this.options.settings;
		debugger;
		var self = this;
		$btn.text("checking");
		if (
			this.options.oldServer == this.options.settings.attr('server')
			&&
			this.options.oldName == this.options.settings.attr('summonerName')
		) {	// no change - spare the request
			debugger;
			self.window.close(); return; }
			$.get(
				RIOT_ADAPTER_URL + '/getSummonerId.php'
				, {'server': settings.attr('server'), 'summoner': settings.attr('summonerName')}
				, function (summonerId, status, jqXHR) {
					steal.dev.log('data:', summonerId, 'status:', status, 'jqXHR:', jqXHR);
					settings.attr('summonerId', summonerId);
					self.window.close();
				})
				.fail(function (data, status, jqXHR) {
					steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
					//Error.summonerSettings(data.responseText); // TODO
					settings.attr('summonerId', null);
					$btn.text("try again");
				});
	},
	'#server-region-select change': function ($el, ev) {
		this.options.settings.attr('server', $el.val());
	},
	'#summoner-name-input change': function ($el, ev) {
		this.options.settings.attr('summonerName', $el.val());
	}
});
module.exports = SettingsCtrl;