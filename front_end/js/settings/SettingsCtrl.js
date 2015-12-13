"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, function (can
		, /**WindowCtrl*/ WindowCtrl) {

		/**
		 * Controller for the "Settings" view (settings.html / settings.js)
		 * @inheritDoc WindowCtrl
		 */
		var SettingsCtrl = WindowCtrl.extend('SettingsCtrl', {
			defaults: {
				name: 'Settings',
				settingsTmpl: 'templates/settings.mustache',
				loadingSpinnerTmpl: 'templates/parts/loading-spinner.mustache'
			}
		}, {
			/**
			 * @param options
			 */
			init: function (options) {
				var self = this;

				WindowCtrl.prototype.init.apply(self, arguments);

				$.when(WindowCtrl.open('Settings')).then(function (/**ODKWindow*/ odkWindow) {
					self.odkWindow = odkWindow;
				});
				self.renderView();

				//this.element.find('#summoner-name-input').focus();
			},
			renderView: function () {
				this.element.find('#content').html(
					can.view(this.options.settingsTmpl, this.options.settings)
				);
				this.element.removeClass('hidden');
			},

			noRequestNeccessary: function () {
				var settings = this.options.settings;
				// testing string;
				return SettingsModel.isSummonerSet()
					&& typeof settings.changedPropsOriginalValues.server === "undefined"
					&& typeof settings.changedPropsOriginalValues.summonerName === "undefined"
					&& settings.summonerName() != "---";
			},
			saveAndCloseHandler: function (self, $btn) {
				/**@type {SettingsModel} */
				var settings = self.options.settings;
				if (
					self.noRequestNeccessary()
				) {	// no change - spare the request
					self.closeSettings();
				} else {
					this.requestSummonerId(settings, self, $btn)
						.then(function () {
							WindowCtrl.events.trigger('summonerChangedEv');
							window.setTimeout(function () {
								self.closeSettings();
							});
						});
				}
			},
			requestSummonerId: function (settings, self, $btn) {
				var def = $.Deferred();
				$.get(
						RIOT_ADAPTER_URL + '/getSummonerId.php'
					, {'server': settings.server(), 'summoner': settings.summonerName()}
					, function (summonerId, status, jqXHR) {
						steal.dev.log('data:', summonerId, 'status:', status, 'jqXHR:', jqXHR);
						settings.summonerId(summonerId);
						def.resolve(summonerId, status, jqXHR);
					})
					.fail(function (data, status, jqXHR) {
						steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
						settings.summonerId(null);
						// TODO: Error message and try again on the button
						// 503 temp unavailable
						// 404 not found
						// statusText 'error' == kein Internet??
						$btn.text(data.statusText);
						def.reject(data, status, jqXHR);
					});
				return def.promise();
			},
			closeSettings: function () {
				var self = this;
				WindowCtrl.events.trigger('settingsClosed');
				window.setTimeout(function () {
					WindowCtrl.close(self.odkWindow.name);
				});

			},
			'#btn-save-close click': function ($btn, ev) {
				$btn.text('checking'); // TODO: replace with class
				this.saveAndCloseHandler(this, $btn);
			},
			'.btn-close click': function ($el, ev) {
				var self = this;
				self.closeSettings();
			},
			'.btn-cancel click': function ($el, ev) {
				var self = this;
				// restore the old settings-values
				this.options.settings.reset();
				self.closeSettings();
			},
			'#server-region-select change': function ($el, ev) {
				this.options.settings.server($el.val());
			},
			'#summoner-name-input change': function ($el, ev) {
				this.options.settings.summonerName($el.val());
			},
			'.hotkey-btn click': function ($el, ev) {
				var self = this;

				// TODO: find a cleaner solution
				$(document).off('focus');
				$(document).on('focus', focusHandler);
				steal.dev.warn('document events:', $._data(document, 'events'));
				function focusHandler() {
					steal.dev.log('focusHandler after hotkey-btn click called');
					$.when(self.options.settings.loadHotKeys()).then(function (noValueGiven) {
						steal.dev.log('hotkeys reloaded');
						self.renderView();
						self.element.find('#hotkeys-rows').show();
					});
				}
			},
			'#summoner-name-input focus': function ($el, ev) {
				$el.val('');
			}
		});
		return SettingsCtrl;
	});