"use strict";
steal(
	'can'
	, 'ChampionModel.js'
	, 'SpellModel.js'
	, 'Routes.js'
	, function (can
		, /**ChampionModel*/ ChampionModel
		, /**SpellModel*/ SpellModel
		, /**Routes*/ Routes) {

		/**
		 * @class
		 * @constructor {@link ChampionCtrl.init}
		 */
		var ChampionCtrl = can.Control.extend('ChampionCtrl',
			/**
			 * @lends ChampionCtrl
			 */
			{
			defaults: {
				panelTmpl: 'templates/champion-panel.mustache',

				// handled routes
				showTeamRoute: Routes.panelTeam,
				addChampRoute: Routes.panelChampion,
				closeAllPanelsRoute: Routes.closeAllPanels,
				closeSinglePanelsRoute: Routes.closePanel,
				hideTooltipRoute: Routes.tooltipHide
			}
		}, {
			/**
			 * @constructs
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
				//if (this.options.panels.length >= 5) {
				//	this.options.panels.pop();
				//}
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
				$('#close-all-btn').removeClass('hidden')
			},
			removeCloseAllBtn: function () {
				$('#close-all-btn').addClass('hidden');
			},
			closeAllPanels: function () {
				this.options.panels.replace(new can.List());

				$('.team').find('.portrait').addClass('addable');
				$('.show-team').addClass('addable');

				this.removeCloseAllBtn();
			},
			removePanel: function (champName) {
				var self = this;

				$('.team').find('[title="' + champName + '"]').addClass('addable');
				$('.show-team').addClass('addable');

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
			removePanelById: function (id) { // TODO: currently unused - maybe useful if new panel after max is added on the end and first one gets removed
				var panel = this.options.panels.splice(id, 1)[0];
				if (this.options.panels.length <= 1) {
					this.removeCloseAllBtn();
				}
				$('.team').find('[title="' + panel.champ.key + '"]').addClass('addable'); // TODO: test this and fix if name of champ comes from elsewhere then panel.champ.key
			},
			/** * @param team 'blue' or 'purple' */
			showTeam: function (team) {
				var self = this;
				self.closeAllPanels();
				var teamList = new can.List();
				this.options.match[team].map(function (participant) {
					teamList.push(self.options.match.participantsByChamp[participant.champ.name]);
				});
				self.options.panels.replace(teamList);
				$('.show-team.' + team).removeClass('addable');
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
			'{hideTooltipRoute} route': function (routeData) {
				//$('.sticky-tooltip').removeClass('sticky-tooltip'); // TODO: centralize this somewhere (in tooltip or somewhere)
				$('.playable').removeClass('active'); // TODO: centralize this somewhere (in tooltip or somewhere)
			},
			'{closeSinglePanelsRoute} route': function (routeData) {
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
					//$panel.removeClass('sticky-tooltip');
					$('#champion-container .active').removeClass('active');
				}
				return $panel;
			},

			'.spell mouseenter': function ($el, ev) {
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
				//$panel.toggleClass('sticky-tooltip');
				$el.toggleClass('active');
				$el.siblings().removeClass('active');
				//}
				if (can.route.attr('video') == 1){
					steal.dev.log('setting video:0');
					can.route.attr('video',0);
				} else {
					steal.dev.log('setting video:1');
					can.route.attr('video',1);
				}
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
				//if (!$panel.hasClass('sticky-tooltip')) {
					can.route.attr({route: Routes.tooltipHide}, true);
				//}
			}
		});
		return ChampionCtrl;
	});