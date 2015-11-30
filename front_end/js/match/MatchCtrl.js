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
				},
				blurHandlersAttached: []
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

					var self = this;

					self.countDocumentBlurHandlers = 0;
					WindowCtrl.prototype.init.apply(self, arguments);

					var mouseUpCb = function(info){
						if (info.onGame === true){
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
					$(MatchCtrl).on('minimized', function () {

					});
					/**
					 * @event MatchCtrl#restored
					 */
					$(MatchCtrl).on('restored', function () {

					});
					/**
					 * @event MatchCtrl#collapsed
					 */
					$(MatchCtrl).on('collapsed', function () {
						var $appBar = $(self.options.appBar);
						$appBar.addClass('collapsed');
					});
					/**
					 * @event MatchCtrl#expanded
					 */
					$(MatchCtrl).on('expanded', function () {
						var $appBar = $(self.options.appBar);
						$appBar.removeClass('collapsed');
					});

					overwolf.windows.obtainDeclaredWindow(self.options.name, function (/** WindowResultData */ result) {
						self.options.odkWindow = result.window;
						var x = self.constructor.getCenteredX(self.options.odkWindow.width), y = 0;
						overwolf.windows.changePosition(self.options.odkWindow.id, x, y);

						self.initAppBar();

						options.model.attr('summonerId', options.settings.summonerId()); // TODO: model refactoring for computes
						options.model.attr('server', options.settings.server()); // TODO: model refactoring for computes
						if (options.settings.startMatchCollapsed()) {
							self.hidePanels();
							$(self.options.handle).addClass(self.options.handleAnimationClass);
							$(self.options.appBar).addClass(self.options.animatedHandleClass);

						}

						localStorage.setItem('lock_getCachedGame', '0');
						localStorage.removeItem('temp_gameId');

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

					delete self.options.overview;
					delete self.options.champions;
					delete self.options.tooltip;

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

							var pollForStableFPS = function(){
								var interval = window.setInterval(function(){
									if (self.options.settings.mostRecentFPS() === 'stable'){
										// FPS is stable - if data loading finishes after FPS-stable, match-opoening will be delayed until settings.mostRecentFPS('stable') got called
										self.constructor.openMatch();
										window.clearInterval(interval);
									}
								}, 100);
							};
							pollForStableFPS();


						})
						.fail(function (data, status, jqXHR) {
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
					$.when(self.loadMatch()).always($.proxy(this.expandPanels, this))
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
					$(this.options.appBar).removeClass(this.options.animatedHandleClass);
					$(this.options.handle).removeClass(this.options.handleAnimationClass);

					var $panelContainer = this.options.$panelContainer;
					$panelContainer.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						$(MatchCtrl).trigger('expanded');
					});
				},
				/** Collapse the champion panels
				 * @fires MatchCtrl#collapsed
				 * */
				hidePanels: function () {
					var $panelContainer = this.options.$panelContainer;
					can.route.attr({route: Routes.tooltipHide}, true);
					$panelContainer.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL, function () {
						$(MatchCtrl).trigger('collapsed');
					});
				},
// Eventhandler
				'mouseenter': function (element, ev) {
					var self = this;
					self.expandPanels();
				},
				'{appBar} mousedown': function (appBar, ev) {
					if (ev.which == 1) { this.togglePanels(appBar); }
				},
				'{reloadBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						can.route.attr({route: Routes.reloadMatch});
						ev.stopPropagation();
					}
				},
				'{togglePanelsRoute} route': function (routeData) {
					steal.dev.log('toggle/all route');
					can.route.attr({'route': ''});
					this.togglePanels($(this.options.appBar));
				},
				'{expandPanelsRoute} route': function (routeData) {
					steal.dev.log('show/all - routeData:', routeData);
					this.expandPanels();
					can.route.attr({'route': ""});
				},
				'{reloadMatchRoute} route': function (routeData) {
					//steal.dev.log('refresh Route triggered in OverviewCtrl');
					//this.options.match = routeData.match;
					//this.renderView(this.options.match.blue,this.options.match.purple);
					this.options.settings.startMatchCollapsed(false);
					//this.reloadMatch();
					location.reload();
					can.route.attr({}, true);
					$(MatchCtrl).trigger('restored');
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
										can.route.attr({route: Routes.reloadMatch});
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