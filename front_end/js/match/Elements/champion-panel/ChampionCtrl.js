"use strict";
var can = require('can');
var ChampionModel = require('ChampionModel');
var SpellModel = require('SpellModel');

var Routes = require('Routes');
/**
 * @see ChampionCtrl.init
 */
var ChampionCtrl = can.Control.extend('ChampionCtrl', {
	defaults: {
		panelTmpl: 'templates/champion-panel.mustache',

		// handled routes
		showTeamRoute: Routes.panelTeam,
		addChampRoute: Routes.panelChampion,
		closeAllPanelsRoute: Routes.closeAllPanels,
		closeSinglePanelsRoute: Routes.closePanel
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
		 * @property {number} index - 1-based
		 */
		/**
		 * Participant[]
		 * @type {can.List}
		 */
		this.options.panels = new can.List();

		this.element.append(
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
		steal.dev.log(this.options.panels);
		if (this.element.find('[title="' + champName + '"]').length) {
			return;
		}
		if (this.options.panels.length >= 5) {
			this.options.panels.pop();
		}
		var panel = this.options.match.participantsByChamp[champName];
		panel.index = this.options.panels.length;
		this.options.panels.push(panel);

		window.setTimeout(function () {
			var $newPanel = $('.champion-panel[data-name="' + champName + '"]');
			$newPanel.hide();
			$newPanel.slideDown();
		}, 1);
	},
	addCloseAllBtn: function () {
		debugger;
		$('#close-all-btn').removeClass('hidden')
	},
	removeCloseAllBtn: function () {
		$('#close-all-btn').addClass('hidden');
	},
	closeAllPanels: function () {
		this.options.panels.replace(new can.List());
		$('.team').find('.portrait').addClass('addable');
		this.removeCloseAllBtn();
	},
	removePanel: function (champName) {
		var self = this;
		$('.team').find('[title="'+ champName +'"]').addClass('addable');
		this.options.panels.each(function (item, index) {
			if (champName == item.champ.name) {
				self.options.panels.splice(index, 1);
				return false;
			}
		});
		if (this.options.panels.length <= 1) {
			this.removeCloseAllBtn();
		}
	},
	removePanelById: function (id) {
		this.options.panels.splice(id, 1);
		if (this.options.panels.length <= 1) {
			this.removeCloseAllBtn();
		}
	},
	/** * @param team 'blue' or 'purple' */
	showTeam: function (team) {
		debugger;
		var self = this;
		var teamList = new can.List();
		this.options.match[team].map(function (participant) {
			teamList.push(self.options.match.participantsByChamp[participant.champ.name]);
		});
		self.options.panels.replace(teamList);
	},

	'{showTeamRoute} route': function (data) {
		steal.dev.log(':team route triggered - adding Panels for Team:', data.team);
		can.route.attr({route: Routes.tooltipHide}, true);
		this.showTeam(data.team);
		this.addCloseAllBtn();
	},
	'{addChampRoute} route': function (data) {
		steal.dev.log(':champ route triggered - adding champ', data.champ);
		can.route.attr({route: Routes.tooltipHide}, true);
		this.addPanel(data.champ);
		if (this.options.panels.length >= 2) {
			this.addCloseAllBtn();
		}
	},
	'{closeAllPanelsRoute} route': function (routeData) {
		steal.dev.log('close/panel/all');
		can.route.attr({'route': ''});
		this.closeAllPanels();
	},
	'{closeSinglePanelsRoute route}': function (routeData) {
		steal.dev.log('close Panel route', routeData);
		can.route.attr({'route': ''});
		this.removePanelById(routeData.id);
	},
	'.close click': function ($el, ev) {
		var self = this;
		can.route.attr({route: Routes.tooltipHide}, true);
		var $panel = $el.closest('.panel');
		var champName = $el.closest('.panel').attr('data-name');
		$panel.slideUp(function () {
			self.removePanel(champName);
		});
	},
	'#close-all-btn click': function () {
		var self = this;
		can.route.attr({route: Routes.tooltipHide}, true);
		$('.champion-panel').slideUp(function () {
			self.closeAllPanels();
		});
	},
	mouseenterHandler: function ($el) {
		var $panel = $el.closest('.panel');

		if (!$el.hasClass('active')) {
			$panel.removeClass('sticky-tooltip');
			$('#champion-container .active').removeClass('active');
		}
		return $panel;
	},

	'.spell mouseenter': function ($el, ev) {
		debugger;
		var $panel = this.mouseenterHandler($el);
		can.route.attr({
			route: Routes.tooltipSpell,
			champ: $panel.attr('data-name'),
			index: $el.attr('data-index-1') - 1,
			type: $el.attr('data-type'),
			y: $panel.offset().top + $panel.height()
		});
	},
	'.spell click': function ($el, ev) {
		//steal.dev.log('clicked on .spell');
		var $panel = $el.closest('.panel');
		//if (!$el.hasClass('active')){
		$panel.toggleClass('sticky-tooltip');
		$el.toggleClass('active');
		$el.siblings().removeClass('active');
		//}
	},
	'.portrait mouseenter': function ($el, ev) {
		var $panel = this.mouseenterHandler($el);

		can.route.attr({
			route: Routes.tooltipChampion,
			champ: $panel.attr('data-name'),
			y: $panel.offset().top + $panel.height()
		});
	},
	'.img mouseout': function ($el, ev) {
		var $panel = $el.closest('.panel');
		if (!$panel.hasClass('sticky-tooltip')) {
			can.route.attr({route: Routes.tooltipHide}, true);
		}
	}
});
module.exports = ChampionCtrl;