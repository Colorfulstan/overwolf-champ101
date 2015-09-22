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
			 * @param options.settings {SettingsModel} - the SettingsModel object
			 */
			init: function (options) {
				var self = this;

				WindowCtrl.prototype.init.apply(self, arguments);

				// backup for checking for changes and possible restore on cancel
				self.options.settingsBackup = self.options.settings.clone();

				$.when(self.constructor.open('Settings', 800, 600)).then(function (ow_window) {
					self.ow_window = ow_window;
				});
				debugger;
				this.element.find('#content').html(
					can.view(self.options.settingsTmpl, self.options.settings)
				);
				//this.element.find('#summoner-name-input').focus();
			},

			saveAndCloseHandler: function (self, $btn) {
				var settings = self.options.settings;
				if (
					settings.isSummonerSet()
					&& self.options.settingsBackup.attr('server') == settings.attr('server')
					&& self.options.settingsBackup.attr('summonerName') == settings.attr('summonerName')
					&& settings.attr('summonerName') != "---" // testing string
				) {	// no change - spare the request
					debugger;
					self.constructor.close(self.ow_window.name);
				} else {
					$.get(
						RIOT_ADAPTER_URL + '/getSummonerId.php'
						, {'server': settings.attr('server'), 'summoner': settings.attr('summonerName')}
						, function (summonerId, status, jqXHR) {
							steal.dev.log('data:', summonerId, 'status:', status, 'jqXHR:', jqXHR);
							settings.attr('summonerId', summonerId);
							//delete self.options.settingsBackup;
							//self.options.settingsBackup = settings.clone();
							self.constructor.close(self.ow_window.name);
						})
						.fail(function (data, status, jqXHR) {
							steal.dev.log('data:', data, 'status:', status, 'jqXHR:', jqXHR);
							//Error.summonerSettings(data.responseText); // TODO
							settings.attr('summonerId', null);
							// TODO: Error message and try again on the button
							// 503 temp unavailable
							// 404 not found
							// statusText 'error' == kein Internet??
							$btn.text(data.statusText);
						});
				}
			},
			'#btn-save-close click': function ($btn, ev) {
				$btn.text('checking'); // TODO: replace with class
				this.saveAndCloseHandler(this, $btn);
			},
			'.btn-close click': function ($el, ev) {
				var self = this;
				window.setTimeout(function () {
					self.constructor.close(self.ow_window.name);
				}, 100);
			},
			'#btn-cancel click': function ($el, ev) {
				// restore the old settings-values
				this.options.settings.copyFrom(this.options.settingsBackup);
				// close window
				this.constructor.close(this.ow_window.name);
			},
			'#server-region-select change': function ($el, ev) {
				this.options.settings.attr('server', $el.val());
			},
			'#summoner-name-input change': function ($el, ev) {
				this.options.settings.attr('summonerName', $el.val());
			},
			'#summoner-name-input focus': function ($el, ev) {
				$el.val('');
				console.log('yub');
			}
		});
		return SettingsCtrl;
	});