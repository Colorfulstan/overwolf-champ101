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

	loadMatch: function ($loadingdiv, summonerId, server) {
		var self = this;
		$loadingdiv.addClass('loading');
		$.when(this.loadData(summonerId, server))
			.then(function (data) {
				// TODO
				self.data = data;
				$loadingdiv.removeClass('loading');
				steal.dev.log(data);
			}).fail(function (data, status, jqXHR) {

				steal.dev.log(data, status, jqXHR);
				$loadingdiv
					.addClass('failed open-settings')
					.removeClass('loading')
					.text("Match could not be loaded!\nClick here to check your settings.");
			});

		//self.loadChampPortraits($blueSideDiv, data.blue, 'blue');
		//self.loadChampPortraits($purpleSideDiv, data.purple, 'purple');
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
	}
});
module.exports = MatchCtrl;