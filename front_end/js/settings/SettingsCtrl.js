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

				$.when(self.constructor.open('Settings')).then(function (/**ODKWindow*/ odkWindow) {
					self.odkWindow = odkWindow;
				});
				this.element.find('#content').html(
					can.view(self.options.settingsTmpl, self.options.settings)
				);
				//this.element.find('#summoner-name-input').focus();
			},

			noRequestNeccessary: function () {
				var settings = this.options.settings;
				// testing string;
				return SettingsModel.isSummonerSet()
					&& typeof settings.changedProps.server === "undefined"
					&& typeof settings.changedProps.summonerName === "undefined"
					&& settings.summonerName() != "---";
			}, saveAndCloseHandler: function (self, $btn) {
				/**@type {SettingsModel} */
				var settings = self.options.settings;
				if (
					self.noRequestNeccessary()
				) {	// no change - spare the request
					self.constructor.close(self.odkWindow.name);
				} else {
					this.requestSummonerId(settings, self, $btn);
				}
			},
			requestSummonerId: function (settings, self, $btn) {
				$.get(
					RIOT_ADAPTER_URL + '/getSummonerId.php'
					, {'server': settings.server(), 'summoner': settings.summonerName()}
					, function (summonerId, status, jqXHR) {
						steal.dev.log('data:', summonerId, 'status:', status, 'jqXHR:', jqXHR);
						settings.summonerId(summonerId);
						self.constructor.close(self.odkWindow.name);
					})
					.fail(function (data, status, jqXHR) {
						steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
						settings.summonerId(null);
						// TODO: Error message and try again on the button
						// 503 temp unavailable
						// 404 not found
						// statusText 'error' == kein Internet??
						$btn.text(data.statusText);
					});
			},
			'#btn-save-close click': function ($btn, ev) {
				$btn.text('checking'); // TODO: replace with class
				this.saveAndCloseHandler(this, $btn);
			},
			'.btn-close click': function ($el, ev) {
				var self = this;
				window.setTimeout(function () {
					self.constructor.close(self.odkWindow.name);
				}, 100);
			},
			'#btn-cancel click': function ($el, ev) {
				// restore the old settings-values
				this.options.settings.reset();
				// close window
				this.constructor.close(this.odkWindow.name);
			},
			'#server-region-select change': function ($el, ev) {
				this.options.settings.server($el.val());
			},
			'#summoner-name-input change': function ($el, ev) {
				this.options.settings.summonerName($el.val());
			},
			'#summoner-name-input focus': function ($el, ev) {
				$el.val('');
				console.log('yub');
			}
		});
		return SettingsCtrl;
	});