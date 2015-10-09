"use strict";
steal(
	'can.js'
	, 'Routes.js'
	, 'SettingsModel.js'
	, function (can
		, /**Routes*/ Routes
		, /**SettingsModel*/ SettingsModel) {

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
					, /** CSSSelectorString */ homeBtn: '.btn-home'
					, /** CSSSelectorString */ helpBtn: '.btn-help'
					, /** CSSSelectorString */ feedbackBtn: '.btn-feedback'
					, /** CSSSelectorString */ closeBtn: '.btn-close',

					// handled routes
					/**@inheritDoc Routes.toggleWindow */
					toggleWindowRoute: Routes.toggleWindow
				},
				/**@static*/
				SCREEN_WIDTH: window.screen.availWidth,
				/**@static*/
				SCREEN_HEIGHT: window.screen.availHeight,

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
								deferred.resolve(odkWindow);
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
								deferred.resolve(null);
							} else {
								$.when(self.open(name)).then(function (/**ODKWindow*/ odkWindow) {
									deferred.resolve(odkWindow);
								});
							}
						}
					});
					return deferred.promise();
				},
				/**@static*/
				openHelp: function () {
					// TODO: implement
				},
				openFeedback: function () {
					//var name = 'Feedback';
					//var self = this;
					//$.when(this.open(name, 500, 500)).then(function ( /**ODKWindow*/ odkWindow) {
					//	steal.dev.log("WindowCtrl.openFeedback: ", odkWindow);
					//	//	// TODO: should this window open centered even after relocating it? => not position it at all
					//	debugger;
					//	var x = self.getCenteredX(odkWindow.width);
					//	var y = self.getCenteredY(odkWindow.height);
					//	overwolf.windows.changePosition(odkWindow.id, x, y);
					//});
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
				openMatch: function () {
					$.when(this.open('Match')).then(function (/**ODKWindow*/ odkWindow) {
						steal.dev.log("WindowCtrl.openMatch: ", odkWindow);
					});
				},
				/** Opens the Home / Main Window */
				openMain: function () {
					$.when(this.open('Main')).then(function (/**ODKWindow*/ odkWindow) {
						steal.dev.log("WindowCtrl.openMain: ", odkWindow);
					});
				},
				/** closes the Match-Window */
				closeMatch: function () { this.close('Match'); },
				/** Opens the Settings-Window and positions it centered on the screen */
				openSettings: function () {
					var self = this;
					$.when(this.open('Settings')).then(function (/**ODKWindow*/ odkWindow) {
						steal.dev.log("WindowCtrl.openSettings: ", odkWindow);
						//	// TODO: should this window open centered even after relocating it? => not position it at all
						var x = self.getCenteredX(odkWindow.width);
						var y = self.getCenteredY(odkWindow.height);
						overwolf.windows.changePosition(odkWindow.id, x, y);
					});
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
					var newNodeString = '<div class="whats-this-display text-body">' + $el.attr('title') + '</div>';
					if ($el.parent().next('div').hasClass('whats-this-display')) { // close it again
						$OpenWhats.remove();
					} else if ($OpenWhats.length) { // another one is open - close that and open targeted
						$OpenWhats.remove();
						$el.parent().after(newNodeString);
					} else { // just open it
						$el.parent().after(newNodeString);
					}
				},

				'.drag-window-handle mousedown': function ($el, ev) {
					steal.dev.log('dragging');
					this.constructor.dragMove(this.options.name);
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
						this.constructor.close(this.options.name);
						ev.stopPropagation();
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.resizeBtn*/
				'{resizeBtn} mousedown': function ($el, ev) {
					this.constructor.dragResize(this.options.name, 'BottomRight');
					ev.stopPropagation();
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
						this.constructor.minimize(this.options.name);
						ev.stopPropagation();
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
						this.constructor.openSettings();
						ev.stopPropagation();
					}
				}
				,
				/** Does prevent Event propagation
				 * @listens MouseEvent#mousedown for the left MouseButton
				 * @param $el
				 * @param ev
				 * @see WindowCtrl.defaults.homeBtn*/
				'{homeBtn} mousedown': function ($el, ev) {
					if (ev.which == 1) {
						this.constructor.openMain();
						ev.stopPropagation();
					}
				}
				,
				/**
				 * calls {@link WindowCtrl.toggle}
				 * @listens can.Route#route {@link toggleWindowRoute}
				 * @fires can.Route#route {@link Routes.expandPanels}
				 * @param {ODKWindow.name} routeData.window
				 * */
				'{toggleWindowRoute} route': function (routeData) {
					steal.dev.log('toggle/:window - routeData:', routeData);
					debugger;
					WindowCtrl.toggle(routeData.window);
					can.route.attr({'route': Routes.expandPanels});

				}
				//,
				//'{helpBtn} mousedown': function ($el, ev) {
				// if (event.which == 1) {
				//	this.constructor.openHelp();
				//	ev.stopPropagation();
				// }
				//}
				//,
				//'{feedbackBtn} mousedown': function ($el, ev) {
				// if (event.which == 1) {
				//	this.constructor.openFeedback();
				//	ev.stopPropagation();
				// }
				//}
			});
		return WindowCtrl;
	});
