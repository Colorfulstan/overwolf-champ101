/**
 * Panel
 * @typedef {object} Panel
 * @property {ChampionModel} champ
 * @property {SpellModel[]} summonerSpells // TODO: not used anymore
 * @property {string} team
 * @property {number} index - 1-based
 */

"use strict";
import can from 'can';
import ChampionModel from 'ChampionModel';
import SpellModel from 'SpellModel';
import Routes from 'Routes';
import analytics from 'analytics';

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
					var numShownPanels = this.options.panels.length;
					if (numShownPanels >= 4) {
						analytics.event('Champions', 'show', '4 or more (manually)', {eventValue: numShownPanels});
						if (numShownPanels >= 6) {
							this.options.panels.pop();
						}
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
					$('#close-all-btn').removeClass('hidden');
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

					this.options.panels.each(function (/** Panel */ item, index) {
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
				/** * @param team 'blue' or 'red' */
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
					Routes.setRoute(Routes.tooltipHide, true);
					this.showTeam(data.team);
					this.addCloseAllBtn();
				},
				'{addChampRoute} route': function (data) {
					steal.dev.log(':champ route triggered - adding champ', data.champ);
					Routes.setRoute(Routes.tooltipHide, true);
					this.addPanel(data.champ);
					if (this.options.panels.length >= 2) {
						this.addCloseAllBtn();
					}
				},
				'{closeAllPanelsRoute} route': function (routeData) {
					steal.dev.log('close/panel/all');
					Routes.resetRoute();
					this.closeAllPanels();
				},
				'{hideTooltipRoute} route': function (routeData) {
					//$('.sticky-tooltip').removeClass('sticky-tooltip'); // TODO: centralize this somewhere (in tooltip or somewhere)
					$('.playable').removeClass('active'); // TODO: centralize this somewhere (in tooltip or somewhere)
				},
				'{closeSinglePanelsRoute} route': function (routeData) {
					steal.dev.log('close Panel route', routeData);
					Routes.resetRoute();
					this.removePanelById(routeData.id);
				},
				'.close click': function ($el, ev) {
					var self = this;
					Routes.setRoute(Routes.tooltipHide, true);
					var $panel = $el.closest('.panel');
					var champName = $el.closest('.panel').attr('data-name');
					$panel.slideUp(function () {
						self.removePanel(champName);
					});
					analytics.event('Champions', 'close', 'one');
				},
				'#close-all-btn click': function () {
					var self = this;
					Routes.setRoute(Routes.tooltipHide, true);
					$('.champion-panel').slideUp(function () {
						self.closeAllPanels();
					});
					analytics.event('Champions', 'close', 'all');
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
					Routes.setRouteData({
						route: Routes.tooltipSpell,
						champ: $panel.attr('data-name'),
						index: $el.attr('data-index-1') - 1,
						type: $el.attr('data-type'),
						y: $panel.offset().top + $panel.height(),
						x: $panel.offset().left
					}, true);
					analytics.screenview('Spell-' + $el.attr('data-type') + '-' + $panel.attr('data-name')); // TODO: maybe remove bc saves a lot of requests
				},
				'.spell click': function ($el, ev) {
					//steal.dev.log('clicked on .spell');
					//var $panel = $el.closest('.panel');
					//if (!$el.hasClass('active')){
					//$panel.toggleClass('sticky-tooltip');
					$el.toggleClass('active');
					$el.siblings().removeClass('active');
					var $panel = this.mouseenterHandler($el);
					//}
					if (Routes.attr('video') == 1) {
						steal.dev.log('setting video:0');
						Routes.setRouteData({
							route: Routes.tooltipSpell,
							champ: $panel.attr('data-name'),
							index: $el.attr('data-index-1') - 1,
							type: $el.attr('data-type'),
							y: $panel.offset().top + $panel.height(),
							x: $panel.offset().left,
							'video': 0
						}, true);
						analytics.event('Video', 'stop');
					} else {
						steal.dev.log('setting video:1');

						Routes.setRouteData({
							route: Routes.tooltipSpell,
							champ: $panel.attr('data-name'),
							index: $el.attr('data-index-1') - 1,
							type: $el.attr('data-type'),
							y: $panel.offset().top + $panel.height(),
							x: $panel.offset().left,
							'video': 1
						}, true);
						analytics.event('Video', 'play');
					}
				},
				'.portrait mouseenter': function ($el, ev) {
					var $panel = this.mouseenterHandler($el);

					Routes.setRouteData({
						route: Routes.tooltipChampion,
						champ: $panel.attr('data-name'),
						y: $panel.offset().top + $panel.height(),
						x: $panel.offset().left
					}, true);
					analytics.screenview('Champ-Tips' + $panel.attr('data-name')); // TODO: maybe remove bc saves a lot of requests
				},
				'.img mouseout': function ($el, ev) {
					//var $panel = $el.closest('.panel');
					//if (!$panel.hasClass('sticky-tooltip')) {
					Routes.setRoute(Routes.tooltipHide, true);
					//}
				}
			});
		export default ChampionCtrl;
