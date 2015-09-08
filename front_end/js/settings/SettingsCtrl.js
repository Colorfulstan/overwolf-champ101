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


		var self = this;
		$.when(WindowCtrl.open('Settings')).then(function (ow_window) {
			self.options.ow_window = ow_window;
		});
		debugger;
		this.element.html(
			can.view(this.options.settingsTmpl, this.options.settings)
		);
	},

	'#btn-save-close click': function ($btn, ev) {
		var settings = this.options.settings;
		debugger;
		var self = this;
		$btn.text("checking"); // TODO: replace with class
		if (
			this.options.oldServer == this.options.settings.attr('server')
			&&
			this.options.oldName == this.options.settings.attr('summonerName')
		) {	// no change - spare the request
			debugger;
			WindowCtrl.close(self.options.ow_window.name);
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
				WindowCtrl.close(self.options.ow_window.name);
			})
			.fail(function (data, status, jqXHR) {
				steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
				//Error.summonerSettings(data.responseText); // TODO
				settings.attr('summonerId', null);
				$btn.text("try again");
			});
	},
	'.btn-close mousedown': function ($el, ev) {
		var self = this;
		window.setTimeout(function () {
			WindowCtrl.close(self.options.ow_window.name);
		}, 100);
	},
	'mousedown': function (el, ev) {
		steal.dev.log('dragging');
		WindowCtrl.dragMove(this.options.ow_window.name);
	},
	'#server-region-select change': function ($el, ev) {
		this.options.settings.attr('server', $el.val());
	},
	'#summoner-name-input change': function ($el, ev) {
		this.options.settings.attr('summonerName', $el.val());
	},
	'.whats-this click': function ($el, ev) {
		debugger;
		var $whats = $('.whats-this-display');
		if ($whats.length) {
			$whats.remove();
		} else {
			$el.append('<div class="whats-this-display">' + $el.attr('title') + '</div>');
		}
	}
});
module.exports = SettingsCtrl;