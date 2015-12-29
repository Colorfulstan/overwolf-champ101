"use strict";
steal(
	'can.js'
	, 'Routes.js'
	, 'SettingsModel.js'
	, 'analytics.js'
	, function (can
		, /**Routes*/ Routes
		, /**SettingsModel*/ SettingsModel
		, analytics) {

		/**
		 * Provides basic Window-Interaction Methods and Eventhandler for common Elements
		 * Like dragging / resizing, closing, etc.
		 * @class
		 * @abstract
		 * @static
		 * @typedef {can.Control} WindowCtrl
		 * @extends {can.Control}
		 * @constructor {@link WindowCtrl.init}
		 */
		var WindowCtrl = can.Control.extend('WindowCtrl',
			/**@lend WindowCtrl*/
			{
				defaults: {
					/** CSSSelectorString */ resizeBtn: '.btn-resize'
					, /** CSSSelectorString */ minimizeBtn: '.btn-minimize'
					, /** CSSSelectorString */ settingsBtn: '.btn-settings'
					, /** CSSSelectorString */ infoBtn: '.btn-info'
					, /** CSSSelectorString */ helpBtn: '.btn-help'
					, /** CSSSelectorString */ feedbackBtn: '.btn-feedback'
					, /** CSSSelectorString */ closeBtn: '.btn-close'
					, /** CSSSelectorString */ rogLink: '.rog-logo a'
					, /** CSSSelectorString */ dropdownListBtn: '[data-control="c101-dropdown"]'
					, /** CSSSelectorString */ dropdownListTarget: '[data-c101-dropdown]',

					// handled routes
					/**@inheritDoc Routes.toggleWindow */
					toggleWindowRoute: Routes.toggleWindow,
					restoreWindowRoute: Routes.restoreWindow
				},
				/**@static*/
				SCREEN_WIDTH: window.screen.availWidth,
				/**@static*/
				SCREEN_HEIGHT: window.screen.availHeight,
				/**
				 * Object for attaching and triggering Events for this Controller.
				 * Usage:
				 * WindowCtrl.events.on(...)
				 * WindowCtrl.events.trigger(...)
				 *
				 * Possible Events (emitted or listened on somewhere):
				 *
				 * collapsed after Match-panels got collapsed
				 * expanded after Match-panels got expanded
				 * minimized after a window got minimized
				 * restored after a window got restored
				 *
				 * fpsStable - when fps has been stabilized at the start of a game
				 * summonerChangedEv - triggered when summonerId has changed
				 *
				 * matchReady - when match-data is loaded
				 * gameStarted - when league-game has started
				 * gameEnded - when league game has ended
				 *
				 * settingsClosed - called right before Settingswindow closes
				 * reloadMatchEv - when the match should get reloaded through external sources
				 * restartAppEv - when the App will be restarted
				 * updateHotkeysEv - when the Hotkeys bound should be refreshed and possible changes send to analytics
				 */
				events: {
					"on": function (type, cb) {
						$(this).on(type, cb);
					},
					"one": function (type, cb) {
						$(this).one(type, cb);
					},
					/**
					 * triggers an Event for all Windows.
					 * @param type
					 * @param {Array | Object} [data] data to be given to the eventHandler <br>(NOTE: DATA CAN ONLY BE USED IF THE EVENT IS TRIGGERED IN THE SAME WINDOW THAT HANDLES THE EVENT)
					 */
					"trigger": function (type, data) {
						steal.dev.log('triggering event', type);
						var storageEventKey = 'eventFired';
						var valueDivider = '||';

						$(this).trigger(type, data);
						localStorage.setItem(storageEventKey, type + valueDivider + new Date());
					},
					"off": function (type) {
						$(this).off(type);
					}
				},
				enableStorageEvents: function () {
					var storageEventKey = 'eventFired';
					var valueDivider = '||';
					$(window).off('storage');
					$(window).on('storage', function () { // does not trigger for the window that made the storage-changes
						if (event.key === storageEventKey) {
							var evType = extractEvent(event.newValue);
							WindowCtrl.events.trigger(evType);
							steal.dev.log(event);
						}
					});

					function extractEvent(value) {
						return value.substr(0, value.indexOf(valueDivider));
					}
				},
				/**@static*/
				getCenteredX: function (winWidth) {
					return parseInt(this.SCREEN_WIDTH / 2 - winWidth / 2);
				},
				/**@static*/
				getCenteredY: function (winHeight) {
					return parseInt(this.SCREEN_HEIGHT / 2 - winHeight / 2);
				},
				/** @static*/
				dragResize: function (/**{ODKWindow.name} */ name, /** WindowDragEdge */edge) {
					overwolf.windows.dragResize(name, edge);
				},
				/** @static*/
				dragMove: function (/** ODKWindow.name */ name) {
					overwolf.windows.dragMove(name);
				},
				/** @static*/
				minimize: function (/** ODKWindow.name */ name) {
					overwolf.windows.minimize(name);
				},
				/** opens the {@link ODKWindow} with the given {@link ODKWindow.name}
				 * @static
				 * @memberOf WindowCtrl
				 * @returns {Promise | ODKWindow} */
				open: function (name) {
					var deferred = $.Deferred();
					overwolf.windows.obtainDeclaredWindow(name, function (result) {
						if (result.status == "success") {
							var odkWindow = result.window;
							overwolf.windows.restore(odkWindow.id, function (result) {

								$.when(analytics.isReady)
									.then(function () {
										window.gaw = analytics;
										WindowCtrl.events.trigger('restored');
										deferred.resolve(odkWindow);
										window.gaw.screenview(name);
									})
									.fail(function () {console.error(arguments)});

							});
						}
					});
					return deferred.promise();
				},
				/** Minimizes or restores a window, depending on the previous state of the window.
				 * @param {ODKWindow.name} name
				 * @return {Promise | ODKWindow | null } after the Window got minimized or restored resolving
				 * to the { @link ODKWindow} object when window got restored or to null if it got minimized
				 * @static */
				toggle: function (name) {
					var self = this;
					var deferred = $.Deferred();
					overwolf.windows.obtainDeclaredWindow(name, function (result) {
						if (result.status == "success") {
							if (result.window.isVisible) {
								self.minimize(name);
								if (name == 'Match') {
									SettingsModel.isMatchMinimized(true);
								}
								deferred.resolve(null);
							} else {
								$.when(self.open(name)).then(function (/**ODKWindow*/ odkWindow) {
									deferred.resolve(odkWindow);
									if (name == 'Match') {
										SettingsModel.isMatchMinimized(false);
									}
								});
							}
						}
					});
					return deferred.promise();
				},

				/**
				 * closes the window with the given {@link ODKWindow.name}
				 * @returns {Promise | ODKWindow}
				 */
				close: function (name) {
					var deferred = $.Deferred();
					overwolf.windows.obtainDeclaredWindow(name, function (result) {
						if (result.status == "success") {
							var odkWindow = result.window;
							overwolf.windows.close(odkWindow.id, function (/** ODKWindow */ result) {
								steal.dev.log('window closed', result);
								deferred.resolve(result);
							});
						}
					});
					return deferred.promise();
				},
				/** Opens the Match Window */
				openMatch: function (needsReload) {
					var p = WindowCtrl.open('Match').then(function () {
						if (needsReload) { WindowCtrl.events.trigger('reloadMatchEv');}
					});
					return p;
				},
				/** Opens the Home / Main Window */
				openMain: function () {
					return WindowCtrl.open('Main');
				},
				/** closes the Match-Window */
				closeMatch: function () {
					debugger;
					return WindowCtrl.close('Match');
				},
				/** Opens the Settings-Window and positions it centered on the screen */
				openSettings: function () {
					var self = this;
					$.when(WindowCtrl.open('Settings')).then(function (/**ODKWindow*/ odkWindow) {
						steal.dev.log("WindowCtrl.openSettings: ", odkWindow);


						if (!SettingsModel.isSummonerSet()) {
							overwolf.windows.setTopmost(odkWindow.id, true, function () {
								steal.dev.log('Settingswindow set to topmost', arguments)
							});
						}
						if (!localStorage.getItem('settings-opened-before')) {
							// Only center settings-window the first time it opens
							var x = self.getCenteredX(odkWindow.width);
							var y = self.getCenteredY(500);
							overwolf.windows.changePosition(odkWindow.id, x, y);
							localStorage.setItem('settings-opened-before', 'true');
						}
					});
				},
				/**
				 * @param name of the WIndow to check as defined within manifest.json
				 * @returns {Promise | boolean} Promise that resolves into boolean wether Window is visible or not
				 */
				isWindowVisible: function (name) {
					var def = $.Deferred();
					overwolf.windows.obtainDeclaredWindow(name, function (result) {
						if (result.status == "success") {
							if (result.window.isVisible) {
								def.resolve(true);
							} else {
								def.resolve(false);
							}
						}
					});
					return def.promise();
				}
			},
			{ // Instance
				/** @constructs
				 * @param {CSSSelectorString} el for the Element to listen on for events
				 * @param {{}} options
				 * @param {string} [options.name] - {@link ODKWindow.name} for debug-purposes */ // TODO: options.name here neccessary / given?
				init: function (el, options) {
					steal.dev.log('WindowCtrl initialized for ', options.name);
					// delegate focus/blur-event to document
					// enables using and testing document.focus() since $(window).focus() does nothing
					$(window).on('focus', function () {$(document).focus()});
					$(window).on('blur', function () {$(document).blur()});
					//WindowCtrl.enableStorageEvents();
				}
				,
				/** @type {ODKWindow} */
				odkWindow: null, // TODO: is this neccessary to have? Not used within WindowCtrl

				/** a) opens the text for the "what's this" link clicked
				 * b) closes all other open "what's this" texts and opens it for the target
				 * c) closes the targeted "what's this" links text
				 * by adding a div right after the parent of the clicked element
				 * @param $el
				 * @param ev
				 * @listens MouseEvent#click */
				'.whats-this click': function ($el, ev) {
					var $OpenWhats = $('.whats-this-display');
					var newNodeString = '<div class="whats-this-display text-body"><p>' + $el.attr('title') + '</p></div>';
					if ($el.parent().next('div').hasClass('whats-this-display')) { // close it again
						$OpenWhats.remove();
					} else {
						if ($OpenWhats.length) { // another one is open - close that before opening targeted
							$OpenWhats.remove();
						}
						$el.parent().after(newNodeString);
						analytics.event('?', 'show', $el.parent().attr('for'));
					}
				},

				'.drag-window-handle mousedown': function ($el, ev) {
					steal.dev.log('dragging');
					WindowCtrl.dragMove(this.options.name);
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.resizeBtn*/
				'{resizeBtn} mousedown': function ($el, ev) {
					WindowCtrl.dragResize(this.options.name, 'BottomRight');
					ev.stopPropagation();
					analytics.event('Window', 'resize');
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.minimizeBtn*/
				'{minimizeBtn} mousedown': function ($el, ev) {
					steal.dev.log('WindowCtrl: minimize window');
					if (ev.which == 1) {
						WindowCtrl.minimize(this.options.name);
						ev.stopPropagation();
						analytics.event('Button', 'click', 'minimize');
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown for the left Mousebutton
				 * @param $el
				 * @param ev
				 *
				 * @see WindowCtrl.defaults.closeBtn
				 */
				'{closeBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						WindowCtrl.close(this.options.name);
						ev.stopPropagation();
						analytics.event('Button', 'click', 'close');
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown for the left MouseButton
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.settingsBtn*/
				'{settingsBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						steal.dev.log('WindowCtrl: open settings');
						WindowCtrl.openSettings();
						ev.stopPropagation();
						analytics.event('Button', 'click', 'Settings');
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown for the left MouseButton
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.infoBtn*/
				'{infoBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						WindowCtrl.openMain();
						ev.stopPropagation();
						analytics.event('Button', 'click', 'Info');
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown for the left MouseButton
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.dropdownListBtn*/
				'{dropdownListBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						let targets = WindowCtrl.defaults.dropdownListTarget;
						let listId = $el.attr('data-target');
						let list = $('#' + listId);
						if (list.css('display') === 'none') {
							analytics.screenview('Info-' + listId);
						}
						$el.next(targets).siblings(targets).slideUp();
						list.slideToggle();
						ev.stopPropagation();
					}
				}
				,
				'{rogLink} click': function () {
					analytics.event('AdLink', 'click', 'ROG-Logo');
				},
				/**
				 * calls {@link WindowCtrl.toggle}
				 * @listens can.Route#route {@link toggleWindowRoute}
				 * @fires can.Route#route {@link Routes.expandPanels}
				 * @param {ODKWindow.name} routeData.window
				 * */
				'{toggleWindowRoute} route': function (routeData) {
					steal.dev.log('toggle/:window - routeData:', routeData);
					WindowCtrl.toggle(routeData.window);
					Routes.setRoute('', true);
				}
				,
				/**
				 * calls {@link WindowCtrl.open}
				 * @listens can.Route#route {@link restoreWindowRoute}
				 * @param {ODKWindow.name} routeData.window
				 * */
				'{restoreWindowRoute} route': function (routeData) {
					steal.dev.log('restore/:window - routeData:', routeData);
					WindowCtrl.open(routeData.window);
					if (routeData.window == 'Match') {
						SettingsModel.isMatchMinimized(false);
					}
					Routes.setRoute('', true);
				}
			});
		return WindowCtrl;
	});
