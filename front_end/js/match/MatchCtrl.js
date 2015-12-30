"use strict";
steal('can.js'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, 'SettingsProvider.js'
	, 'OverviewCtrl.js'
	, 'ChampionCtrl.js'
	, 'TooltipCtrl.js'
	, 'Routes.js'
	, 'Boot.js'
	, 'analytics.js'
	, 'global.js'
	, function (can
		, /**WindowCtrl*/ WindowCtrl
		, /**SettingsModel*/ SettingsModel
		, /**SettingsProvider*/ Settings
		, /**OverviewCtrl*/ OverviewCtrl
		, /**ChampionCtrl*/ ChampionCtrl
		, /**TooltipCtrl*/ TooltipCtrl
		, /**Routes*/ Routes
		, /**Boot*/ Boot
		, analytics) {
// TODO: replace with events for application-wide communication
		/**
		 *  Controller for the "Match" view (match.html / match.js)
		 * @class MatchCtrl
		 * @extends WindowCtrl
		 * @constructor {@link MatchCtrl.init}
		 * @member {object} options.events an object to set and trigger events on reachable over self.options.events
		 */
		var MatchCtrl = WindowCtrl.extend(
			{
				defaults: {
					name: 'Match',
					$panelContainer: $('#panel-container'),
					$appButtons: $('.app-buttons'),
					$overviewContainer: $('#match-overview-container'),

					reloadBtn: '.btn-reload',
					appBar: '#match-app-bar',
					handle: '#handle',

					loadingTmpl: 'templates/parts/match-loading.mustache',

					handleAnimationClass: 'animated-bg',
					animatedHandleClass: 'animated-handle',

					// handled routes
					togglePanelsRoute: Routes.togglePanels,
					expandPanelsRoute: Routes.expandPanels,
					reloadMatchRoute: Routes.reloadMatch
				}
			}, {

				/**
				 * @param element
				 * @param options
				 * @param {boolean} options.startCollapsed if true, start minimized and add class for bg-animation
				 * @param {MatchDAO} options.dao
				 * @param {MatchModel} options.model
				 * @constructs
				 */
				init: function (element, options) {
					WindowCtrl.prototype.init.apply(this, arguments);
					var self = this;
					registerEventHandlers();

					self.countDocumentBlurHandlers = 0; // TODO: remove, nut used


					self.options.$document = $(document); // TODO: remove, not used anymore
					self.options.matchPromise = options.model;


					overwolf.windows.obtainDeclaredWindow(self.options.name, function (/** WindowResultData */ result) {
						self.options.odkWindow = result.window;
						var x = WindowCtrl.getCenteredX(self.options.odkWindow.width), y = 0;
						//x += 100; // accounting for App-Buttons on the right
						x -= 14; // accounting for unknown positioning flaw
						overwolf.windows.changePosition(self.options.odkWindow.id, x, y);

						//options.settings.cachedGameAvailable(false);
						//localStorage.removeItem('temp_gameId');

						self.loadMatch(self.options.matchPromise);
					});

					function registerEventHandlers() {
						// TODO: are these events cleaned up after Match window closes?
						overwolf.games.inputTracking
							.onMouseUp
							.addListener(function (info) {
								if (info.onGame === true) {
									self.hidePanels();
								}
							});
						/**
						 * @event MatchCtrl#minimized
						 */
						WindowCtrl.events.on('minimized', function () {

						});
						/**
						 * @event MatchCtrl#restored
						 */
						WindowCtrl.events.on('restored', function () {

						});

						WindowCtrl.events.on('gameEnded', function () {
							steal.dev.log('should expand now!');
							self.expandPanels();
						});
						/**
						 * @event MatchCtrl#collapsed
						 */
						WindowCtrl.events.on('collapsed', function () {
							var $appBar = $(self.options.appBar);
							$appBar.addClass('collapsed');
							options.$panelContainer.css({display: 'none'});
							options.$appButtons.css({display: 'none'});
						});
						/**
						 * @event MatchCtrl#expanded
						 */
						WindowCtrl.events.on('expanded', function () {
							var $appBar = $(self.options.appBar);
							$appBar.removeClass('collapsed');
							options.$panelContainer.css({display: 'block'});
							options.$appButtons.css({display: 'block'});
						});

						WindowCtrl.events.on('matchReady', function () {
							steal.dev.log(new Date(), 'matchReady triggered');
							WindowCtrl.openMatch().then(function () {
								if (options.settings.startMatchCollapsed()) {
									WindowCtrl.events.trigger('collapsed');
									$(self.options.handle).addClass(self.options.handleAnimationClass);
									$(self.options.appBar).addClass(self.options.animatedHandleClass);
								} else {
									var $appBar = $(self.options.appBar);
									if ($appBar.hasClass('collapsed')) {
										self.expandPanels();
									}
								}
							});
						});

						WindowCtrl.events.on('summonerChangedEv', function () {
							Routes.setRoute(Routes.reloadMatch);
						});
						WindowCtrl.events.on('reloadMatchEv', function () {
							Routes.setRoute(Routes.reloadMatch);
						});
					}
				},
				initVisibility: function (self) {
					$(self.options.appBar).show();
					if (self.options.settings.startMatchCollapsed()) {
						self.options.$panelContainer.css({display: 'none'});
						self.options.$appButtons.css({display: 'none'});
						WindowCtrl.events.trigger('collapsed');

					} else {
						self.options.$panelContainer.css({display: 'block'});
						self.options.$appButtons.css({display: 'block'});
						WindowCtrl.events.trigger('expanded');
					}
				},

				loadMatch: function (matchPromise) {
					/** @this self*/
					var self = this;

					var deferred = $.Deferred();

					var rejectCb = function (data, status, jqXHR) {
						steal.dev.warn("Loading Match failed!", data, status, jqXHR);
						self.options.$overviewContainer.removeClass('loading').addClass('failed');
						if (data.status == 503) {
							self.options.$overviewContainer.find('failed-state .message').html('<h3>Riot-Api is temporarily unavailable. You may try again later.</h3>');
						}
						analytics.event('Match', 'failed', data.status + ' | ' + data.statusText);
						WindowCtrl.events.trigger('matchReady');
						deferred.reject(data, status, jqXHR);
					};
					var resolveCB = function (matchModel) {
						if (typeof matchModel[1] === 'string' && matchModel[1] === 'error') {
							var args = matchModel;
							rejectCb(args[0], args[1], args[2]); // delegating to .fail() callback
						} else {
							// TODO: find a cleaner solution for this (side-effects)
							self.options.$overviewContainer.removeClass('loading');
							// Controller for Overview-Panel
							self.options.overview = new OverviewCtrl('#match-overview-container', {match: matchModel});
							// Controller for Champion-Panels
							self.options.champions = new ChampionCtrl('#champion-container', {match: matchModel});
							// Controller for Tooltip
							self.options.tooltip = new TooltipCtrl('#tooltip-container', {match: matchModel});
							analytics.event('Match', 'loaded');
							WindowCtrl.events.trigger('matchReady');
							deferred.resolve(matchModel);
						}
					};

					var waitForStableFps = window.setInterval(function () {
						if (self.options.settings.isFpsStable()) {
							steal.dev.log(new Date(), 'fps are stable, beginning to show Match-Window');
							//console.log('fps stable', localStorage.getItem(SettingsModel.STORAGE_FPS_STABLE));
							// FPS is stable - if data loading finishes before FPS-stable, match-opoening will be delayed until settings.isFpsStable('true') got called
							window.clearInterval(waitForStableFps);
							self.initVisibility(self);

							var name = self.options.settings.summonerName();
							self.options.$overviewContainer.html(can.view(self.options.loadingTmpl, {summonerName: name}));
							self.options.$overviewContainer.removeClass('failed').addClass('loading');

							// clean up old controllers // TODO: does this make sense?
							if (self.options.overview) { self.options.overview.destroy() }
							if (self.options.champions) { self.options.champions.destroy() }
							if (self.options.tooltip) { self.options.tooltip.destroy() }

							$.when(matchPromise).done(resolveCB).fail(rejectCb);
						}
					}, 100);
					return deferred.promise();
				},
				reloadMatch: function () {
					//var self = this;
					steal.dev.warn('calling reloadMatch()');

					//this.options.match = routeData.match;
					//this.renderView(this.options.match.blue,this.options.match.purple);

					location.reload();
					// NOTE: this is executed BEFORE window gets reloaded
					// TODO: move elsewhere if makes sense
					Routes.resetRoute();
					WindowCtrl.events.trigger('restored');

					//// TODO: currently not used due to memory leak - reloading window as whole when reloading for now
					//var self = this;
					//
					//var model = self.options.model;
					//model.summonerId = self.options.settings.summonerId();
					//model.server = self.options.settings.server();
					//self.options.matchPromise = self.options.dao.loadMatchModel(model);
					//$.when(self.loadMatch()).always(function () {
					//	$.proxy(self.expandPanels, self);
					//})
				},
				/**
				 * collapses or expands the champion-panels
				 * @param appBar the html Node handle of the Match-Window
				 */
				togglePanels: function (appBar) {
					if ($(appBar).hasClass('collapsed')) {
						this.expandPanels();
					} else {
						this.hidePanels();
					}
				},
				/**
				 * @fires MatchCtrl#expanded
				 */
				expandPanels: function () {
					var self = this;
					$(self.options.appBar).removeClass(self.options.animatedHandleClass);
					$(self.options.handle).removeClass(self.options.handleAnimationClass);

					self.options.$appButtons.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL);
					self.options.$panelContainer.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						WindowCtrl.events.trigger('expanded');
					});
					analytics.screenview('Match-Overview');
				},
				/** Collapse the champion panels
				 * @fires MatchCtrl#collapsed
				 * */
				hidePanels: function () {
					var self = this;
					Routes.setRoute(Routes.tooltipHide, true);

					self.options.$appButtons.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL);
					self.options.$panelContainer.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						WindowCtrl.events.trigger('collapsed');
					});
				},
// Eventhandler
				'mouseenter': function (element, ev) {
					// so that we don't open it by accident (too often)
					this.options.expansionTimeout = window.setTimeout($.proxy(this.expandPanels, this), 100);
				},
				'mouseleave': function (element, ev) {
					window.clearTimeout(this.options.expansionTimeout);
				},
				'{appBar} mousedown': function (appBar, ev) {
					if (ev.which == 1) { this.togglePanels(appBar); }
					analytics.event('Button', 'click', 'app-bar');
				},
				'{reloadBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						Boot._showMatchLoading(Settings.getInstance()).then(function () {
							Routes.setRoute(Routes.reloadMatch, true);
						});
						ev.stopPropagation();
					}
					analytics.event('Button', 'click', 'reload-match');
				},
				'{togglePanelsRoute} route': function (routeData) {
					steal.dev.log('toggle/all route');
					Routes.resetRoute();
					this.togglePanels($(this.options.appBar));
				},
				'{expandPanelsRoute} route': function (routeData) {
					steal.dev.log('show/all - routeData:', routeData);
					this.expandPanels();
					Routes.resetRoute();
				},
				'{reloadMatchRoute} route': function (routeData) {
					var self = this;
					self.reloadMatch();
				}
			});
		return MatchCtrl;
	})
;