"use strict";
steal(
	'can'
	, 'global.js'
	, function (can) {
		/**
		 * @class {can.Model} SettingsModel
		 * @extends {can.Model}
		 * @constructor {@link SettingsModel.init}
		 * @property summonerName {String}
		 * @property summonerId {number}
		 * @property server {String}
		 * @property hideHomeAtStart {boolean}
		 * @property startMatchCollapsed {boolean}
		 * @property hotkeys {Hotkey[]} has to be initialized through {@see loadHotKeys}
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
			}
		}, {
			/**
			 * @constructs
			 */
			init: function () { // TODO: refactor this class into a can.Map with can.computes as properties
				/**@property summonerName attr('summonerName') */ // TODO: how to document this?
				this.attr('summonerName', this._summonerName());
				this.bind('summonerName', this._summonerName);

				/**@property summonerId attr('summonerId') */ // TODO: how to document this?
				this.attr('summonerId', this._summonerId());
				this.bind('summonerId', this._summonerId);

				/**@property server attr('server') */ // TODO: how to document this?
				this.attr('server', this._server());
				this.bind('server', this._server);

				/**@property startMatchCollapsed attr('startMatchCollapsed') */ // TODO: how to document this?
				this.attr('startMatchCollapsed', this._startMatchCollapsed());
				this.bind('startMatchCollapsed', this._startMatchCollapsed);

				/**@property hideHomeAtStart attr('hideHomeAtStart') */ // TODO: how to document this?
				this.attr('hideHomeAtStart', this._hideHomeAtStart());
				this.bind('hideHomeAtStart', this._hideHomeAtStart);
				/**@property hideHomeAtStartInfo attr('hideHomeAtStartInfo')
				 * @readonly */ // TODO: how to document this?
				this.attr('hideHomeAtStartInfo', "This will prevent the Start Window to show up when you enter a Game");

				/**@property startMatchCollapsed attr('startMatchCollapsed') */ // TODO: how to document this?
				this.attr('sideViewEnabled', this._sideViewEnabled());
				this.bind('sideViewEnabled', this._sideViewEnabled);
				/**@property sideViewEnabledInfo attr('sideViewEnabledInfo')
				 * @readonly */ // TODO: how to document this?
				this.attr('sideViewEnabledInfo', "This will display the Match Window on the left edge of the screen instead of the top edge");

				// NOTE: this.attr('hotkeys') gets initialized externally within settings.js
				//this.bind('hotkeys', SettingsModel.getHotKeys()); // TODO: Hotkey Änderung binden??

			},
			/** @private */
			_server: function (ev, newVal, oldVal) {
				if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_REGION, newVal);
					localStorage.setItem('lock_getCachedGame', "0"); // TODO: move into Settings
				}
			},
			/** @private */
			_summonerName: function (ev, newVal, oldVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
					localStorage.setItem('lock_getCachedGame', "0"); // TODO: move into Settings
				}
			},
			/** @private */
			_summonerId: function (ev, newVal, oldVal) {
				if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
				if (newVal !== oldVal) {
					localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);
					localStorage.setItem('lock_getCachedGame', "0"); // TODO: move into Settings
				}
			},
			/** @private */
			_hideHomeAtStart: function (ev, newVal, oldVal) {
				if (newVal == undefined) {
					return this.hideHomeAtStart();
				}
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_HOME_AT_START);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_HOME_AT_START, newVal);
			},
			/** @private */
			_startMatchCollapsed: function (ev, newVal, oldVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED) == 'true';
				}
				// localstorage entry gets removed for falsy statement
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED, newVal);
			},
			/** @private */
			_sideViewEnabled: function (ev, newVal, oldVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE) == 'true';
				}
				// localstorage entry gets removed for falsy statement
				if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE);
				else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_MATCH_WINDOW_ON_SIDE, newVal);
			},
			// TODO: make these static
			isSummonerSet: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
			},
			hideHomeAtStart: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_HOME_AT_START) == 'true'
			},
			///**
			// * @typedef {Object} Hotkey
			// * @property {String} id
			// * @property {String} string
			// * @return {{ Hotkey[]}}
			// */
			//_hotkeys: function () {
			//	$.when(SettingsModel.getHotKeys()).then(
			//		function (hotkeys) {
			//			return hotkeys;
			//		}
			//	)
			//}
			/**
			 * Loads Hotkeys from the Manifest / overwolf settings and stores them into the SettingsModel instance
			 * @return {Promise} that gets resolved after Hotkeys has been set for this.attr('hotkeys'). Does not resolve into any value
			 */
			loadHotKeys: function () {
				var deferred = $.Deferred();
				var self = this;
				$.when(SettingsModel.getHotKeys()).then(function (hotkeys) {
					self.attr('hotkeys', hotkeys);
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
