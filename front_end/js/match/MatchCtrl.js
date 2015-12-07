"use strict";
steal('can.js'
	, 'WindowCtrl.js'
	, 'SettingsModel.js'
	, 'OverviewCtrl.js'
	, 'ChampionCtrl.js'
	, 'TooltipCtrl.js'
	, 'FeedbackCtrl.js'
	, 'Routes.js'
	, 'global.js'
	, function (can
		, /**WindowCtrl*/ WindowCtrl
		, /**SettingsModel*/ SettingsModel
		, /**OverviewCtrl*/ OverviewCtrl
		, /**ChampionCtrl*/ ChampionCtrl
		, /**TooltipCtrl*/ TooltipCtrl
		, /**FeedbackCtrl*/ FeedbackCtrl
		, /**Routes*/ Routes) {

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

					self.countDocumentBlurHandlers = 0;
					var mouseUpCb = function (info) {
						if (info.onGame === true) {
							self.hidePanels();
						}
					};
					overwolf.games.inputTracking.onMouseUp.addListener(mouseUpCb);

					self.options.$document = $(document);

					options.model.attr('summonerId', options.settings.summonerId()); // TODO: model refactoring for computes
					options.model.attr('server', options.settings.server()); // TODO: model refactoring for computes
					self.options.matchPromise = options.dao.loadMatchModel(options.model);

					/**
					 * @event MatchCtrl#minimized
					 */
					$(WindowCtrl.events).on('minimized', function () {

					});
					/**
					 * @event MatchCtrl#restored
					 */
					$(WindowCtrl.events).on('restored', function () {

					});
					/**
					 * @event MatchCtrl#collapsed
					 */
					$(WindowCtrl.events).on('collapsed', function () {
						var $appBar = $(self.options.appBar);
						$appBar.addClass('collapsed');
					});
					/**
					 * @event MatchCtrl#expanded
					 */
					$(WindowCtrl.events).on('expanded', function () {
						var $appBar = $(self.options.appBar);
						$appBar.removeClass('collapsed');
					});

					overwolf.windows.obtainDeclaredWindow(self.options.name, function (/** WindowResultData */ result) {
						self.options.odkWindow = result.window;
						var x = self.constructor.getCenteredX(self.options.odkWindow.width), y = 0;
						x += 100; // accounting for App-Buttons on the right
						x -= 14; // accounting for unknown positioning flaw
						overwolf.windows.changePosition(self.options.odkWindow.id, x, y);

						self.initAppBar();

						options.model.attr('summonerId', options.settings.summonerId()); // TODO: model refactoring for computes
						options.model.attr('server', options.settings.server()); // TODO: model refactoring for computes
						if (options.settings.startMatchCollapsed()) {
							self.hidePanels();
							$(self.options.handle).addClass(self.options.handleAnimationClass);
							$(self.options.appBar).addClass(self.options.animatedHandleClass);

						}

						//options.settings.cachedGameAvailable(false);
						//localStorage.removeItem('temp_gameId');

						// After successfully loading the Match-Data
						self.loadMatch(options.model);
					});
				},
				/**
				 * Initializes the HTML element depending on if it is shown on the side or top of the screen.
				 * makes the App bar visible
				 */
				initAppBar: function () {
					$(this.options.appBar).show();
				},
				loadMatch: function () {
					var deferred = $.Deferred();

					var self = this;

					var name = this.options.settings.summonerName();
					self.options.$overviewContainer.html(can.view(this.options.loadingTmpl, {summonerName: name}));
					self.options.$overviewContainer.removeClass('failed').addClass('loading');

					// clean up old controllers
					if (self.options.overview) {
						self.options.overview.destroy()
					}
					if (self.options.champions) {
						self.options.champions.destroy()
					}
					if (self.options.tooltip) {
						self.options.tooltip.destroy()
					}

					$.when(self.options.matchPromise)
						.then(function (matchModel) {
							deferred.resolve(matchModel);
							self.options.$overviewContainer.removeClass('loading');
							// Controller for Overview-Panel
							self.options.overview = new OverviewCtrl('#match-overview-container', {match: matchModel});
							// Controller for Champion-Panels
							self.options.champions = new ChampionCtrl('#champion-container', {match: matchModel});
							// Controller for Tooltip
							self.options.tooltip = new TooltipCtrl('#tooltip-container', {match: matchModel});

							var pollForStableFPS = function () {
								var interval = window.setInterval(function () {
									if (self.options.settings.isFpsStable()) {
										// FPS is stable - if data loading finishes before FPS-stable, match-opoening will be delayed until settings.isFpsStable('true') got called

										self.constructor.openMatch();

										window.clearInterval(interval);
									}
								}, 100);
							};
							pollForStableFPS();
						})
						.fail(function (data, status, jqXHR) {
							self.constructor.openMatch();

							steal.dev.warn("Loading Match failed!", data, status, jqXHR);
							self.options.$overviewContainer.removeClass('loading').addClass('failed');
							if (data.status == 503) {
								self.options.$overviewContainer.find('failed-state .message').html('<h3>Riot-Api is temporarily unavailable. You may try again later.</h3>');
							}
							deferred.reject(data, status, jqXHR);
						});
					return deferred.promise();
				},
				reloadMatch: function () {
					var self = this;

					var model = self.options.model;
					model.summonerId = this.options.settings.summonerId();
					model.server = this.options.settings.server();
					self.options.matchPromise = self.options.dao.loadMatchModel(model);
					$.when(self.loadMatch()).always(function () {
						$.proxy(this.expandPanels, this);
					})
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

					var $panelContainer = self.options.$panelContainer;
					$panelContainer.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						$(WindowCtrl.events).trigger('expanded');
					});
				},
				/** Collapse the champion panels
				 * @fires MatchCtrl#collapsed
				 * */
				hidePanels: function () {
					var self = this;
					var $panelContainer = self.options.$panelContainer;
					Routes.setRoute(Routes.tooltipHide, true);
					$panelContainer.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						$(WindowCtrl.events).trigger('collapsed');
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
				},
				'{reloadBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						Routes.setRoute(Routes.reloadMatch, true);
						ev.stopPropagation();
					}
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
					//steal.dev.log('refresh Route triggered in OverviewCtrl');
					//this.options.match = routeData.match;
					//this.renderView(this.options.match.blue,this.options.match.purple);
					this.options.settings.startMatchCollapsed(false);
					//this.reloadMatch();
					location.reload();
					Routes.resetRoute();
					$(WindowCtrl.events).trigger('restored');
				},
				/** Does prevent Event propagation
				 *
				 * NOTE: because all Windows are independent from each other the reload-routing for Match-Window
				 * does not work when accessing settings from another Window.
				 * That's why this event is overwritten here.
				 *
				 * @overwrite WindowCtrl {settingsBtn} mousedown
				 * @listens MouseEvent#mousedown for the left MouseButton
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.settingsBtn*/
				'{settingsBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						steal.dev.log('MatchCtrl: open settings');
						this.constructor.openSettings();

						var settings = new SettingsModel();
						var summonerId = settings.summonerId();
						// Reload the Match-Window after Settings-Window gets closed
						var interval = window.setInterval(function () {
							overwolf.windows.getWindowState('Settings', function (/** WindowStateData */ result) {
								if (result.status == "success" && result.window_state == 'closed') {
									if (summonerId != settings.summonerId()) {
										Routes.setRoute(Routes.reloadMatch);
									}
									window.clearInterval(interval);
								}
							})
						}, 100);
						ev.stopPropagation();
					}
				}
			});
		return MatchCtrl;
	})
;