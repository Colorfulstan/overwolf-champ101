"use strict";
var can = require('can');
var WindowCtrl = require('../WindowCtrl');
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
		self.panelContainer.addClass('loading');
		$.when(self.loadData(summonerId, server))
			.then(function (data) {
				// TODO
				self.panelContainer.removeClass('loading');
				steal.dev.log(data);
				deferred.resolve(data);
			}).fail(function (data, status, jqXHR) {

				steal.dev.log(data, status, jqXHR);
				self.panelContainer
					.addClass('failed open-settings')
					.removeClass('loading')
					.text("Match could not be loaded!\nClick here to check your settings.");
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

	'.open-settings click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
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
	}

});
module.exports = MatchCtrl;