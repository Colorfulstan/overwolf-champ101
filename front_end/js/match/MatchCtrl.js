"use strict";
var can = require('can');
var WindowCtrl = require('../WindowCtrl');
var SettingsModel = require('../settings/SettingsModel');
require('../constants');

/**
 * Controller for the "Match" view
 */
var MatchCtrl = can.Control({
	init: function () {
		this.childWindows = {};
		this.panelContainer = $('#panel-container');

		this.data = {};
	},

	loadMatch: function (summonerId, server) {
		var deferred = $.Deferred();
		var self = this;
		self.panelContainer.removeClass().addClass('loading');
		$.when(self.loadData(summonerId, server))
			.then(function (data) {
				// TODO
				self.panelContainer.removeClass('loading');
				steal.dev.log(data);
				deferred.resolve(data);
			}).fail(function (data, status, jqXHR) {

				steal.dev.log(data, status, jqXHR);
				self.panelContainer
					.removeClass()
					.addClass('failed')
					.append('<button id="open-settings" class="btn pull-right col-xs-3">check settings.</button>');
				self.panelContainer.append('<button id="reload" class="btn pull-right col-xs-3">Reload</button>');
				deferred.reject(data, status, jqXHR);
				self.on();
			});
		return deferred.promise();
	},

	loadData: function (summonerId, server) {
		var self = this;
		var deferred = $.Deferred();

		jQuery.get(RIOT_ADAPTER_URL
			, {summonerId: summonerId, server: server}
			, function (data) { // success

				steal.dev.log("gameData:", data);
				steal.dev.log('blue side: ', data.blue, 'purple side: ', data.purple);
				deferred.resolve(data);

			}).fail(function (data, status, jqXHR) {
				deferred.reject([data, status, jqXHR]);
			});

		return deferred.promise();
	},

	togglePanels: function ($handle) {
		$handle.toggleClass('collapsed');
		this.panelContainer.slideToggle(ANIMATION_SLIDE_SPEED);
	},

	'#pull-down-handle click': function ($handle, ev) {
		this.togglePanels($handle);
	},
	//'#pull-down-handle click': function ($handle, ev) {
	//	this.togglePanels($handle);
	//},

	'#open-settings click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		var self = this;
		var name = 'Settings';
		var win = self.childWindows[name];
		if (!win) win = new WindowCtrl('', {name: name});
		win.open();
		self.childWindows[name] = win;
		steal.dev.log('opensettings triggered', this.childWindows);
	},

	'button.show-team.blue click' : function () {
		can.route.attr({team : 'blue', route: 'show/:team'});
	},

	'button.show-team.purple click' : function () {
		can.route.attr({team : 'purple', route: 'show/:team'});
	},

	'button#reload click': function () {
		var self = this;
		var settings = new SettingsModel();
		this.loadMatch(settings.attr('summonerId'), settings.attr('server'));
	}

});
module.exports = MatchCtrl;