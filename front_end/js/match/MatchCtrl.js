"use strict";
var can = require('can');
var WindowCtrl = require('WindowCtrl');
var MatchDAO = require('MatchDAO');
var MatchModel = require('MatchModel');

var SettingsModel = require('SettingsModel');
var OverviewCtrl = require('OverviewCtrl');
var ChampionCtrl = require('ChampionCtrl');
var TooltipCtrl = require('TooltipCtrl');

require('../global');

/**
 * Controller for the "Match" view
 * @see init
 */
var MatchCtrl = can.Control.extend({
	defaults: {
		openSettingsBtn: '#open-settings',
		reloadBtn: '#reload',
		handle: '#pull-down-handle'
	}
}, {
	/** @property
	 * @type {MatchModel} */
	model: null,

	/**
	 * @constructor
	 * @param element
	 */
	init: function (element, options) {
		this.childWindows = {}; // ???
		this.$panelContainer = $('#panel-container');

		options.settings = new SettingsModel();

		options.dao = new MatchDAO();
		options.model = new MatchModel();
		options.model.attr('summonerId', options.settings.attr('summonerId'));
		options.model.attr('server', options.settings.attr('server'));

		// After successfully loading the Match-Data
		this.loadMatch(options.model)

	},
	loadMatch: function (matchModel) {
		var deferred = $.Deferred();
		debugger;

		var self = this;

		//if (this.model == null) {  // first load
		//	this.model = matchModel;
		//}
		//

		self.$panelContainer.removeClass('failed').addClass('loading');
		$.when(this.options.dao.loadMatchModel(self.options.model))
			.then(function (matchModel) {
				deferred.resolve(matchModel);
				self.$panelContainer.removeClass('loading');
				debugger;
				// Controller for Overview-Panel
				self.options.overview = new OverviewCtrl('#match-overview-container', {match: matchModel});
				// Controller for Champion-Panels
				self.options.champions = new ChampionCtrl('#champion-container', {match: matchModel});
				// Controller for Tooltip
				self.options.tooltip = new TooltipCtrl('#tooltip-container', {match: matchModel});

			}).fail(function (data, status, jqXHR) {
				steal.dev.warn("Loading Match failed!", data, status, jqXHR);
				self.$panelContainer.removeClass('loading').addClass('failed');
				deferred.reject(data, status, jqXHR);
			});
		return deferred.promise();
	},
	togglePanels: function ($handle) {
		var self = this;
		$handle.toggleClass('collapsed');
		//var speed = this.element.height() / 200 * ANIMATION_SLIDE_SPEED_PER_100PX;
		//if (speed < ANIMATION_SLIDE_SPEED_PER_100PX) speed = ANIMATION_SLIDE_SPEED_PER_100PX;
		this.$panelContainer.slideToggle(ANIMATION_SLIDE_SPEED_PER_100PX);
	},

	//' mouseout': function ($el, ev) {
	//	var self = this;
	//	steal.dev.log('mouseout from' , $el);
	//	this.options.mouseLeftMatchWindowTO = window.setTimeout(function () {
	//		self.togglePanels($(MatchCtrl.defaults.handle));
	//	},
	//	1000
	//			//this.settings._mouseOutTimeout()
	//	);
	//},
	//' * mouseenter': function ($el, ev) {
	//	steal.dev.log('mouseenter in' , $el);
	//	window.clearTimeout(this.options.mouseLeftMatchWindowTO);
	//},
	'{handle} click': function ($handle, ev) {
		this.togglePanels($handle);
	},

	'{openSettingsBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		// TODO: do it through routing into WindowCtrl
		var self = this;
		var name = 'Settings';
		var win = self.childWindows[name];
		if (!win) win = new WindowCtrl('', {name: name});
		win.open();
		self.childWindows[name] = win;
		steal.dev.log('opensettings triggered', this.childWindows);
	},

	'button.show-team.blue click': function () {
		can.route.attr({team: 'blue', route: 'show/:team'});
	},

	'button.show-team.purple click': function () {
		can.route.attr({team: 'purple', route: 'show/:team'});
	},

	'{reloadBtn} click': function () {
		debugger;
		delete this.options.settings;
		this.options.settings = new SettingsModel(); // new SettingsModel to get update from localstorage
		this.options.model.attr('server', this.options.settings._server());
		this.options.model.attr('summonerId', this.options.settings._summonerId());
		//this.options.model.attr('server', this.options.settings.attr('server'));
		//this.options.model.attr('summonerId', this.options.settings.attr('summonerId'));

		this.loadMatch(this.options.model);
	}

});
module.exports = MatchCtrl;