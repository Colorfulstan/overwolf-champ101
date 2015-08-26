"use strict";
var can = require('can');
var Settings = require('../settings/SettingsModel');
var WindowCtrl = require('../WindowCtrl');

/**
 * Controller for the "Settings" view
 */
var SettingsCtrl = can.Control({
	init: function () {

		this.window = new WindowCtrl('body#settings', {name: 'Settings'});
		this.window.open();

		this.options.settings = new Settings();
		steal.dev.log('Settings initialized:', this.options.settings);

		this.element.html(
			can.view('../../../views/settings.mustache', this.options.settings)
		);
		this.window.on();
	},

	'#btn-save-close click': function ($btn, ev) {
		var settings = this.options.settings;
		var self = this;
		$btn.text("checking");
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