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

var Routes = require('Routes');

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
		appBar: '#match-app-bar',
		handle: '#handle',
		loadingTmpl: 'templates/parts/match-loading.mustache',

		handleAnimationClass: 'animated-bg',
		animatedHandleClass: 'animated-handle',

		// handled routes
		toggleAllRoute: Routes.togglePanels,
		expandPanelsRoute: Routes.expandPanels
	}

}, {

	/**
	 * @constructor
	 * @param element
	 * @param options
	 * @param options.startCollapsed {boolean} if true, start minimized and add class for bg-animation
	 */
	init: function (element, options) {

		var self = this;
		WindowCtrl.prototype.init.apply(self, arguments);

		options.settings = new SettingsModel();

		options.dao = new MatchDAO();
		options.model = new MatchModel();
		options.model.attr('summonerId', options.settings.attr('summonerId'));
		options.model.attr('server', options.settings.attr('server'));
		debugger;
		if (options.settings.attr('startMatchCollapsed')) {
			debugger;
			self.hidePanels();
			$(self.options.handle).addClass(self.options.handleAnimationClass);
			$(self.options.appBar).addClass(self.options.animatedHandleClass);
		}

		window.name = "Match Window"; // DEBUG INFO

		self.hidePanelsOnClickHandler = $.proxy(self.hidePanels, self);
		localStorage.setItem('lock_getCachedGame','0');
		localStorage.removeItem('temp_gameId');

		// After successfully loading the Match-Data
		self.loadMatch(options.model)

	},
	addMatchWindowBlurHandler: function (handler) {
		if (localStorage.getItem('lock_matchWindowHandler') != "1") {
			overwolf.games.inputTracking.onMouseUp.addListener(handler);
			steal.dev.warn("added hidePanelsOnKlickHandler", handler, localStorage.getItem('lock_matchWindowHandler'));
			localStorage.setItem('lock_matchWindowHandler', "1");
		}
	},
	removeMatchWindowBlurHandler: function (handler) {
		if (localStorage.getItem('lock_matchWindowHandler') == "1") {
			overwolf.games.inputTracking.onMouseUp.removeListener(handler);
			steal.dev.warn("removed hidePanelsOnKlickHandler", handler, localStorage.getItem('lock_matchWindowHandler'));
			localStorage.setItem('lock_matchWindowHandler', "0");
		}
	}
	,
	loadMatch: function (matchModel) {
		var deferred = $.Deferred();

		var self = this;
		debugger;

		var name = this.options.settings.attr('summonerName');
		self.options.$overviewContainer.html(can.view(this.options.loadingTmpl, {summonerName: name}));
		self.options.$overviewContainer.removeClass('failed').addClass('loading');

		delete self.options.overview;
		delete self.options.champions;
		delete self.options.tooltip;

		// if its started within a game then register onblur Handler to the window to collapse automatically
		overwolf.games.getRunningGameInfo(function (data) {
			var gameIsRunning = !(data == undefined || data == null);
			if (gameIsRunning) {

				//// retain the behaviour of collapsing when clicking outside of the Window even after minimizing and restoring it
				//overwolf.windows.onStateChanged.addListener(function (result) {
				//	steal.dev.log('debug', "MatchCtrl - overwolf.windows.onStateChanged:", result);
				//	if (result.window_state == "normal") {
				//		localStorage.setItem('lock_matchWindowJustRestored', "1");
				//	} else {
				//		localStorage.setItem('lock_matchWindowJustRestored', "0");
				//	}
				//});

				$(window).on('blur', function () {
					steal.dev.log('Matchwindow lost focus');
					localStorage.removeItem('lock_matchWindowJustRestored');
					self.hidePanels();
					self.addMatchWindowBlurHandler(self.hidePanelsOnClickHandler);
				});
				$(window).on('focus', function () {
					steal.dev.log('Matchwindow gained focus');
					self.removeMatchWindowBlurHandler(self.hidePanelsOnClickHandler);
				});
			}
		});

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
				if (data.status == 503) {
					self.options.$overviewContainer.find('failed-state .message').html('<h3>Riot-Api is temporarily unavailable. You may try again later.</h3>');
				}
				deferred.reject(data, status, jqXHR);
			});
		return deferred.promise();
	},
	togglePanels: function (appBar) {
		debugger;
		if ($(appBar).hasClass('collapsed')) {
			$(this.options.handle).removeClass(this.options.handleAnimationClass);
			$(appBar).removeClass(this.options.animatedHandleClass);
			this.expandPanels();
		} else {
			this.hidePanels();
		}
	},
	expandPanels: function () {
		$(this.options.appBar).removeClass('collapsed');
		this.options.$panelContainer.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL);
	},
	hidePanels: function () {
		$(this.options.appBar).addClass('collapsed');
		this.options.$panelContainer.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL);
	},

	// Eventhandler
	'{appBar} mousedown': function (appBar, ev) {
		if (ev.which == 1) this.togglePanels(appBar);
	},
	'{reloadBtn} mousedown': function ($el, ev) {
		if (ev.which == 1){
			delete this.options.settings;
			this.options.settings = new SettingsModel(); // new SettingsModel to get update from localstorage
			this.options.model.attr('server', this.options.settings._server());
			this.options.model.attr('summonerId', this.options.settings._summonerId());

			this.loadMatch(this.options.model);
			ev.stopPropagation();
		}
	},
	'{toggleAllRoute} route': function (routeData) {
		steal.dev.log('toggle/all route');
		can.route.attr({'route': ''});
		this.togglePanels($(this.options.appBar));
	},
	'{expandPanelsRoute} route': function (routeData) {
		steal.dev.log('show/all - routeData:', routeData);
		this.expandPanels();
		can.route.attr({'route': ""});
	}
});
module.exports = MatchCtrl;