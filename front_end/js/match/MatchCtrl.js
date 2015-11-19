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

					var self = this;
					WindowCtrl.prototype.init.apply(self, arguments);

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
						self.loadMatch(options.model)

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

					// if its started within a game then register onblur Handler to the window to collapse automatically
					overwolf.games.getRunningGameInfo(function (data) {
						var gameIsRunning = !(data == undefined || data == null);
						if (gameIsRunning) {
							var $document = $(document);

							//localStorage.setItem('lock_matchWindowJustRestored', "1");
							////// retain the behaviour of collapsing when clicking outside of the Window even after minimizing and restoring it
							//overwolf.windows.onStateChanged.addListener(function (result) {
							//	steal.dev.log('debug', "MatchCtrl - overwolf.windows.onStateChanged:", result);
							//	if (result.window_state == "normal") {
							//		localStorage.setItem('lock_matchWindowJustRestored', "1");
							//	} else {
							//		localStorage.setItem('lock_matchWindowJustRestored', "0");
							//	}
							//});
							var callback = $.proxy(self.hidePanels, self);
							self.addDocumentEventhandlers($document, callback);
						}
					});

					$.when(this.options.dao.loadMatchModel(self.options.model))
						.then(function (matchModel) {
							deferred.resolve(matchModel);
							self.options.$overviewContainer.removeClass('loading');
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
				addDocumentEventhandlers: function ($document, callback) {
					localStorage.setItem('lock_OnBlurHandlerIsAdded', "0");

					var self = this;
					self._addBlurHandler(callback);

					$document.on('blur', function () {
						steal.dev.log('Matchwindow lost focus');
						self._addBlurHandler(callback);
					});
					$document.on('focus', function () {
						steal.dev.log('Matchwindow gained focus');
						//// the window actually gets focus BEFORE this value changes through overwolf.window.onstatechanged callback
						//// so we want to remove the handler, if the window not just got restored, but the value will be 1
						//// TODO: fix this through timeout? For better readability
						//if (localStorage.getItem('lock_matchWindowJustRestored') != "1") {
						self._removeBlurHandler(callback)
						//} else {
						//	//$document.blur();
						//}
					});
				}
				,
				removeDocumentEventhandlers: function ($document) {
					$document.off('blur');
					$document.off('focus');
				},
				/**
				 * Adds the given handler if there is none already set (tracked about localStorage settings)
				 * @listens MouseEvent#mouseup
				 * @fires MatchCtrl#hidePanelsOnClickHandler
				 * @param handler
				 * @private
				 */
				_addBlurHandler: function (handler) {
					if (localStorage.getItem('lock_OnBlurHandlerIsAdded') != "1") {
						steal.dev.warn("adding BlurHandler ", handler);
						localStorage.setItem('lock_OnBlurHandlerIsAdded', "1");

						overwolf.games.inputTracking.onMouseUp.addListener(handler);
					}
				},
				/**
				 * removes the given handler if there is none already set (tracked about localStorage settings)
				 * @listens MouseEvent#mouseup
				 * @fires MatchCtrl#hidePanelsOnClickHandler
				 * @param handler
				 * @private
				 */
				_removeBlurHandler: function (handler) {
					if (localStorage.getItem('lock_OnBlurHandlerIsAdded') == "1") {
						steal.dev.warn("removing BlurHandler ", handler);
						localStorage.setItem('lock_OnBlurHandlerIsAdded', "0");

						overwolf.games.inputTracking.onMouseUp.removeListener(handler);
					}
				}
				,
				/**
				 * collapses or expands the champion-panels
				 * @param appBar the html Node handle of the Match-Window
				 */
				togglePanels: function (appBar) {
					if ($(appBar).hasClass('collapsed')) {
						$(this.options.handle).removeClass(this.options.handleAnimationClass);
						$(appBar).removeClass(this.options.animatedHandleClass);
						this.expandPanels();
					} else {
						this.hidePanels();
					}
				},
				expandPanels: function () {
					var $panelContainer = this.options.$panelContainer;
					var $appBar = $(this.options.appBar);
					$panelContainer.slideDown(ANIMATION_SLIDE_SPEED_PER_PANEL);
					$appBar.removeClass('collapsed');
				},
				/** Collapse the champion panels */
				hidePanels: function () {
					var $panelContainer = this.options.$panelContainer;

					//// TODO: centralize this somewhere (in tooltip or somewhere)
					//$panelContainer.find('.sticky-tooltip').removeClass('sticky-tooltip');
					//$panelContainer.find('.pinnable').removeClass('sticky-tooltip');

					can.route.attr({route: Routes.tooltipHide}, true);
					var $appBar = $(this.options.appBar);
					$panelContainer.slideUp(ANIMATION_SLIDE_SPEED_PER_PANEL);
					$appBar.addClass('collapsed');
				},

				// Eventhandler
				'{appBar} mousedown': function (appBar, ev) {
					if (ev.which == 1) this.togglePanels(appBar);
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
					location.reload();
					can.route.attr({}, true);
				}
			});
		return MatchCtrl;
	});