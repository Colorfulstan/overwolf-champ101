"use strict";
steal(
	'can'
	, 'global.js'
	, function (can) {
		/**
		 * @class {can.Model} SettingsModel
		 * @extends {can.Model}
		 * @constructor {@link SettingsModel.init}
		 */
		var SettingsModel = can.Model.extend('SettingsModel', {
			STORAGE_KEY_REGION: 'region-code',
			STORAGE_KEY_NAME: 'summoner-name',
			STORAGE_KEY_ID: 'summoner-id',
			STORAGE_KEY_HOME_AT_START: 'setting-home-at-startup',
			STORAGE_KEY_START_MATCH_COLLAPSED: 'setting-start-match-collapsed',
			STORAGE_KEY_MATCH_WINDOW_ON_SIDE: 'setting-match-position',
			//MOUSEOUT_KEY_ID = 'mouse-out-timeout'

			getManifest: function () {
				var deferred = $.Deferred();
				overwolf.extensions.current.getManifest(function (r) {
					steal.dev.log('Manifest response:', r);
					deferred.resolve(r);
				});
				return deferred.promise();
			},
			/**
			 * @returns {{ Hotkey[] }} hotkeys
			 * @throws Error if arguments are given
			 */
			getHotKeys: function () {

				if (arguments.length != 0) {
					throw new Error('SettingsModel.getHotKeys() can\'t receive Parameter!')
				}

				var deferred = $.Deferred();
				$.when(SettingsModel.getManifest()).then(function (manifest) {
					var promises = [];
					var hotkeys = [];
					for (var hotkeyId in manifest.data.hotkeys) {
						promises.push(SettingsModel.getHotKey(hotkeyId));
						hotkeys.push({id: hotkeyId, title: manifest.data.hotkeys[hotkeyId].title});
					}
					$.when.apply($, promises).then(function () {
						steal.dev.log('arguments of getHotkeys last then(): ', arguments);
						var args = [].slice.call(arguments);
						steal.dev.log('arguments of getHotkeys last then(): ', args);
						args.map(function (item, index) {
							hotkeys[index].string = item.hotkey;
						});
						steal.dev.log('returning: ', hotkeys);
						deferred.resolve(hotkeys);
					});
				});
				return deferred.promise();

			},
			getHotKey: function (id) {
				var deferred = $.Deferred();
				overwolf.settings.getHotKey(id, function (result) {
					steal.dev.log('Hotkey for: ' + id, result);
					deferred.resolve(result);
				});
				return deferred.promise();
			},
			/** Is the Match window being displayed on the side of the screen or on top?
			 * @returns {boolean} */
			sideViewEnabled: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE) == 'true'
			},
			hideHomeAtStart: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_HOME_AT_START) == 'true'
			},
			isSummonerSet: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
			}
		}, {
			/**
			 * @constructs
			 */
			init: function () {

				// NOTE: this.attr('hotkeys') gets initialized externally within settings.js
				//this.bind('hotkeys', SettingsModel.getHotKeys()); // TODO: Hotkey Änderung binden??
			},
			/** @type {string}
			 * @property */
			summonerName: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
					debugger;
					this.cachedGameAvailable(false); // TODO: TEST
				}
			},this),
			/** @type {string}
			 * @propterty */
			summonerId: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);
					debugger;
					this.cachedGameAvailable(false); // TODO: TEST
				}
			},false),
			/** @type {string}
			 * @propterty */
			server: can.compute(function (newVal, oldVal) {
				if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_REGION, newVal);
					debugger;
					this.cachedGameAvailable(false); // TODO: TEST
				}
			}),
			/** @type {boolean}
			 * @propterty */
			startMatchCollapsed: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED) == 'true';
				}
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED, newVal);
			}),
			/** @type {boolean}
			 * @propterty */
			hideHomeAtStart: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) {
					return this.constructor.hideHomeAtStart();
				}
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_HOME_AT_START);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_HOME_AT_START, newVal);
			}),
			/** @type {string}
			 * @propterty
			 * @readonly */
			hideHomeAtStartInfo: "This will prevent the Start Window to show up when you enter a Game",
			/** @type {boolean}
			 * @property */
			sideViewEnabled: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE) == 'true';
				}
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE, newVal);
			}),
			/**
			 * @type {string}
			 * @propterty
			 * @readonly */
			sideViewEnabledInfo: "This will display the Match Window on the left edge of the screen instead of the top edge",

			/**
			 * @property
			 * @type {string}
			 */
			cachedGameId: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) { // getter
					return localStorage.getItem('temp_gameId');
				}
				if (newVal == false) localStorage.removeItem('temp_gameId');
				else if (newVal !== oldVal) localStorage.setItem('temp_gameId', newVal);
			}),
			/**
			 * @property
			 * @type {boolean}
			 */
			cachedGameAvailable: can.compute(function (newVal, oldVal) {
				if (newVal == undefined) { // getter
					return localStorage.getItem('lock_getCachedGame') == 'true';
				} else { // setter
					if (newVal == false) localStorage.removeItem('lock_getCachedGame');
					else if (newVal !== oldVal) localStorage.setItem('lock_getCachedGame', newVal);
				}
			}),

			/**
			 * Loads Hotkeys from the Manifest / overwolf settings and stores them into the SettingsModel instance
			 * @return {Promise} that gets resolved after Hotkeys has been set for this.attr('hotkeys'). Does not resolve into any value
			 */
			loadHotKeys: function () {
				var deferred = $.Deferred();
				var self = this;
				$.when(SettingsModel.getHotKeys()).then(function (hotkeys) {
					self.attr('hotkeys', hotkeys); // TODO: as compute?
					deferred.resolve();
				});
				return deferred.promise();
			},
			/**
			 * rturns a new instance with all the .attr() copied into it
			 * @return {SettingsModel}
			 */
			clone: function () {
				var data = this.attr();
				delete data[this.constructor.id];
				return new this.constructor(data);
			},
			/**
			 * sets all attr() from the given Model in this instance
			 * @param settingsModel
			 */
			copyFrom: function (settingsModel) {
				for (var attrKey in settingsModel.attr()) {
					this.attr(attrKey, settingsModel.attr(attrKey));
				}
			}
		});
		return SettingsModel;
	});
