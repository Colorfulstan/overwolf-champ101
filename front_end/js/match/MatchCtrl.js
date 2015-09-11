"use strict";
var can = require('can');

var WindowCtrl = require('WindowCtrl');
var MatchDAO = require('MatchDAO');
var MatchModel = require('MatchModel');

var SettingsModel = require('SettingsModel');
var OverviewCtrl = require('OverviewCtrl');
var ChampionCtrl = require('ChampionCtrl');
var TooltipCtrl = require('TooltipCtrl');
var FeedbackCtrl = require('FeedbackCtrl');

require('../global');

/**
 * Controller for the "Match" view (match.html / match.js)
 * @inheritDoc WindowCtrl
 * @see init
 */
var MatchCtrl = WindowCtrl.extend({
	defaults: {
		name: 'Match',
		$panelContainer: $('#panel-container'),
		$overviewContainer: $('#match-overview-container'),
		reloadBtn: '.btn-reload',
		handle: '#match-app-bar',
		loadingTmpl: 'templates/parts/match-loading.mustache'
	}
}, {

	/**
	 * @constructor
	 * @param element
	 */
	init: function (element, options) {
		WindowCtrl.prototype.init.apply(this, arguments);

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

		var self = this;
debugger;

		var name = this.options.settings.attr('summonerName');
		self.options.$overviewContainer.html(can.view(this.options.loadingTmpl , {summonerName: name}));
		self.options.$overviewContainer.removeClass('failed').addClass('loading');
		delete self.options.overview;
		delete self.options.champions;
		delete self.options.tooltip;

		$.when(this.options.dao.loadMatchModel(self.options.model))
			.then(function (matchModel) {
				deferred.resolve(matchModel);
				self.options.$overviewContainer.removeClass('loading');
				debugger;
				// Controller for Overview-Panel
				self.options.overview = new OverviewCtrl('#match-overview-container', {match: matchModel});
				// Controller for Champion-Panels
				self.options.champions = new ChampionCtrl('#champion-container', {match: matchModel});
				// Controller for Tooltip
				self.options.tooltip = new TooltipCtrl('#tooltip-container', {match: matchModel});

			}).fail(function (data, status, jqXHR) {
				steal.dev.warn("Loading Match failed!", data, status, jqXHR);
				self.options.$overviewContainer.removeClass('loading').addClass('failed');
				if (data.status == 503){
					self.options.$overviewContainer.find('failed-state .message').html('<h3>Riot-Api is temporarily unavailable. You may try again later.</h3>');
				}
				deferred.reject(data, status, jqXHR);
			});
		return deferred.promise();
	},
	togglePanels: function ($handle) {
		$handle.toggleClass('collapsed');
		//var speed = this.element.height() / 200 * ANIMATION_SLIDE_SPEED_PER_PANEL;
		//if (speed < ANIMATION_SLIDE_SPEED_PER_PANEL) speed = ANIMATION_SLIDE_SPEED_PER_PANEL;
		this.options.$panelContainer.slideToggle(ANIMATION_SLIDE_SPEED_PER_PANEL);
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
	'{handle} mousedown': function ($handle, ev) {
		this.togglePanels($handle);
	},
	'{reloadBtn} mousedown': function ($el, ev) {
		delete this.options.settings;
		this.options.settings = new SettingsModel(); // new SettingsModel to get update from localstorage
		this.options.model.attr('server', this.options.settings._server());
		this.options.model.attr('summonerId', this.options.settings._summonerId());

		this.loadMatch(this.options.model);
		ev.stopPropagation();
	},
	'toggle/all route': function (routeData) {
		steal.dev.log('toggle/all route');
		can.route.attr({'route': ''});
		this.togglePanels($(this.options.handle));

	}
});
module.exports = MatchCtrl;