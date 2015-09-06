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
		homeBtn: '.btn-home',
		openSettingsBtn: '.btn-settings',
		reloadBtn: '.btn-reload',
		openHelpBtn: '.btn-help',
		openFeedbackBtn: '.btn-feedback',
		closeBtn: '.btn-close',
		handle: '#match-app-bar'
	},

	registerHotkeys: function () {
		overwolf.settings.registerHotKey("toggle_panels", function (result) {
			steal.dev.log('Hotkey toggle_panels pressed', result);
			if (result.status == "success") {
				can.route.attr({'route': 'toggle/all'});
				steal.dev.log('can route after hitting toggle_panels', can.route.attr());
			}
		});
		var team_handler = function (result, team) {
			steal.dev.log('Hotkey open_panel_team_' + team + ' pressed', result);
			if (result.status == "success") {
				can.route.attr({'route': 'show/:team', 'team': team});
			}
		};
		overwolf.settings.registerHotKey("open_panels_team_blue", function (result) {
			team_handler(result, 'blue');
		});
		overwolf.settings.registerHotKey("open_panels_team_purple", function (result) {
			team_handler(result, 'purple');
		});

		function create_handler(id){
			return function close_panel_handler(result) {
				steal.dev.log('Hotkey close_panel_' + id + ' pressed', result, 'with id:' + id);
				if (result.status == "success") {
					can.route.attr({'route': 'close/panel/:id', 'id': id});
					steal.dev.log('close_panel_handler route nach Hotkey:', can.route.attr());
				}
			}
		}
		var funcs = [];
		for (var i = 0; i < 5; i++) {
			funcs[i] = create_handler(i);
		}
		for (var j = 0; j < 5; j++) {
			overwolf.settings.registerHotKey("close_panel_" + (j+1), funcs[j]);
			steal.dev.log('registered close_panel_' + (j+1));
		}
	}
}, {

	/**
	 * @constructor
	 * @param element
	 */
	init: function (element, options) {
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

		var self = this;

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
	'{homeBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		WindowCtrl.open('Main');
		ev.stopPropagation();
	},
	'{openSettingsBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		WindowCtrl.openSettings();
		ev.stopPropagation();
	},
	'{openHelpBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		WindowCtrl.openHelp();
		ev.stopPropagation();
	},
	'{openFeedbackBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		WindowCtrl.openFeedback();
		ev.stopPropagation();
	},
	'{closeBtn} click': function ($el, ev) { // TODO: testen wenn laden fehlschlägt
		WindowCtrl.closeMatch();
		ev.stopPropagation();
	},
	'{reloadBtn} click': function ($el, ev) {
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