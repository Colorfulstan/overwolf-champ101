"use strict";
var can = require('can');
var ChampionModel = require('ChampionModel');
var SpellModel = require('SpellModel');
/**
 * @see ChampionCtrl.init
 */
var ChampionCtrl = can.Control.extend('ChampionCtrl', {
	defaults: {
		panelTmpl:'templates/champion-panel.mustache'
	}
}, {
	/**
	 *
	 * @param element
	 * @param options.match {MatchModel}
	 */
	init: function (element, options) {
		/**
		 * Panel
		 * @typedef {Object} Panel
		 * @property {ChampionModel} champ
		 * @property {SpellModel[]} summonerSpells
		 * @property {String} team
		 * @property {number} index
		 */
		/**
		 * Participant[]
		 * @type {can.List}
		 */
		this.options.panels = new can.List();

		this.element.html(
			can.view(this.options.panelTmpl,
				this.options.panels,
				{
					index: function () {
						return ++window['INDEX'] || (window['INDEX'] = 0);
					},
					resetIndex: function () {
						window['INDEX'] = null;
					}
				}
			));
	},
	addPanel: function (champName) {
		if (this.element.find('[alt="' + champName + '"]').length) {
			return;
		}
		if (this.options.panels.length >= 5) {
			this.options.panels.pop();
		}
		var panel = this.options.match.participantsByChamp[champName];
		panel.index = this.options.panels.length;
		this.options.panels.push(panel);
		//window.setTimeout(function(){
		//	$('.champion-panel:not([data-name="'+champName+'"])').addClass('stay');
		//	$('.champion-panel[data-name="'+champName+'"]').slideDown(ANIMATION_SLIDE_SPEED_PER_100PX);
		//}, 1);
	},
	addCloseAllBtn: function () {
		debugger;
		var $close = $('#close-all-btn');
		if ($close.length) {
			$close.show();
		} else {
			var $closeAllBtn = $('<div id="close-all-btn" class="btn close table-cell">');
			this.element.prepend($closeAllBtn);
		}
	},
	removeCloseAllBtn: function () {
		$('#close-all-btn').hide();
	},
	closeAllPanels: function () {
		debugger;
		this.options.panels.replace(new can.List());
		this.removeCloseAllBtn();
	},
	removePanel: function (champ) {
		var self = this;
		this.options.panels.each(function (item, index) {
			if (champ == item.champ.name) {
				self.options.panels.splice(index, 1);
				return false;
			}
		});
		if (this.options.panels.length <= 1) {
			this.removeCloseAllBtn();
		}
	},
	showTeam: function (team) {
		debugger;
		var self = this;
		var teamList = new can.List();
		this.options.match[team].map(function (participant) {
			teamList.push(self.options.match.participantsByChamp[participant.champ.name]);
		});
		self.options.panels.replace(teamList);
		//window.setTimeout(function(){
		//	$('.champion-panel:not(.stay)').slideDown(ANIMATION_SLIDE_SPEED_PER_100PX);
		//	$('.champion-panel').addClass('stay');
		//}, 1);
	},

	'show/:team route': function (data) {
		steal.dev.log(':team route triggered - adding Panels for Team:', data.team);
		can.route.attr({ route: 'tooltip/hide'}, true);
		this.showTeam(data.team);
		this.addCloseAllBtn();
	},
	'add/:champ route': function (data) {
		steal.dev.log(':champ route triggered - adding champ', data.champ);
		can.route.attr({ route: 'tooltip/hide'}, true);
		this.addPanel(data.champ);
		if (this.options.panels.length >= 2) {
			this.addCloseAllBtn();
		}
	},
	'.close click': function ($el, ev) {
		can.route.attr({ route: 'tooltip/hide'}, true);
		var champ = $el.closest('.panel').attr('data-name');
		this.removePanel(champ);
	},
	'#close-all-btn click': function () {
		can.route.attr({ route: 'tooltip/hide'}, true);
		this.closeAllPanels();
	},
	'.spell mouseenter': function ($el, ev) {
		debugger;
		var $panel = $el.closest('.panel');
		can.route.attr({
			route: 'tooltip/spell/:champ/:index',
			champ: $panel.attr('data-name'),
			index: $el.attr('data-index-1') - 1,
			type: $el.attr('data-type'),
			y: $panel.offset().top + $panel.height()
		});
	},
	'.spell click': function ($el, ev) {
		//steal.dev.log('clicked on .spell');
		var $panel = $el.closest('.panel');
		$panel.toggleClass('sticky-tooltip');
	},
	'.portrait mouseenter': function ($el, ev) {
		var $panel = $el.closest('.panel');
		can.route.attr({
			route: 'tooltip/champ/:champ',
			champ: $panel.attr('data-name'),
			y: $panel.offset().top + $panel.height()
		});
	},
	'img mouseout': function ($el, ev) {
		var $panel = $el.closest('.panel');
		if (!$panel.hasClass('sticky-tooltip')){
			can.route.attr({ route: 'tooltip/hide'}, true);
		}
	}
});
module.exports = ChampionCtrl;