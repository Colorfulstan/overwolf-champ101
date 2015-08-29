"use strict";
var can = require('can');
var WindowCtrl = require('../WindowCtrl');
var MatchDAO = require('./MatchDAO');
var MatchModel = require('./MatchModel');

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
	 * @param options
	 * @param options.settings {SettingsModel}
	 * @param options.dao {MatchDAO}
	 */
	init: function (element, options) {
		this.childWindows = {};
		this.$panelContainer = $('#panel-container');
	},
	loadMatch: function (transfer) {
		var deferred = $.Deferred();

		var self = this;
		if (this.model == null) {  // first load
			this.model = transfer;
		}
		this.model.attr('server', this.options.settings._server());
		this.model.attr('summonerId', this.options.settings._summonerId());

		self.$panelContainer.removeClass('failed').addClass('loading');
		$.when(this.options.dao.loadMatchModel(self.model))
			.then(function (match) {
				deferred.resolve(match);
				self.$panelContainer.removeClass('loading');
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
		$.when(this.loadMatch(this.model)).then(function () {
				debugger;
				can.route.attr({'route': 'reload/:window', window: 'match'});
				steal.dev.log(can.route.attr());
			}
		);
	}

});
module.exports = MatchCtrl;