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
			STORAGE_KEY_RELOADING: 'setting-reloading',
			STORAGE_KEY_IN_GAME: 'setting-in-game',
			STORAGE_KEY_START_WITH_GAME: 'setting-start-with-game',
			STORAGE_KEY_CLOSE_MATCH_WITH_GAME: 'setting-close-match-with-game',
			STORAGE_KEY_START_MATCH_COLLAPSED: 'setting-start-match-collapsed',
			STORAGE_KEY_MATCH_WINDOW_ON_SIDE: 'setting-match-position',
			STORAGE_KEY_FRAME_RATE: 'setting-framerate',
			//MOUSEOUT_KEY_ID = 'mouse-out-timeout'

			/** @static */
			getManifest: function () {
				var deferred = $.Deferred();
				overwolf.extensions.current.getManifest(function (r) {
					steal.dev.log('Manifest response:', r);
					deferred.resolve(r);
				});
				return deferred.promise();
			},
			/**
			 * @static
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
			/** @static */
			getHotKey: function (id) {
				var deferred = $.Deferred();
				overwolf.settings.getHotKey(id, function (result) {
					steal.dev.log('Hotkey for: ' + id, result);
					deferred.resolve(result);
				});
				return deferred.promise();
			},
			/** @static */
			isSummonerSet: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
			},
			isMatchMinimized: function (newVal) {
				if (newVal == undefined) { // getter
					return localStorage.getItem('lock_matchMinimized') == 'true';
				} else { // setter
					if (newVal == false) localStorage.removeItem('lock_matchMinimized');
					else if (newVal == true) localStorage.setItem('lock_matchMinimized', 'true');
				}
			},
			/** @static */
			startWithGame: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_START_WITH_GAME) == 'true'
			},
			/** @static */
			isInGame: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_IN_GAME) == 'true'
			},
			/** @static */
			isReloading: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_RELOADING) == 'true'
			},
			/** @static */
			closeMatchWithGame: function () {
				return localStorage.getItem(SettingsModel.STORAGE_KEY_CLOSE_MATCH_WITH_GAME) == 'true'
			}
		}, {
			/**
			 * @constructs
			 */
			init: function () {

				/** Holds the original values of the settings if they where changed.
				 * @typer {string: propName, *: originialValue } */
				this.changedPropsOriginalValues = {};

				// NOTE: this.attr('hotkeys') gets initialized externally within settings.js
			},

			/** @type {string}
			 * @property */
			summonerName: can.compute(function (newVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME); // getter
				else { // setter
					var oldVal = this.summonerName();
					localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
					this.valueChanged('summonerName', oldVal);

					//this.cachedGameAvailable(false); // TODO: TEST
				}
			}, this),
			/** @type {string}
			 * @propterty */
			summonerId: can.compute(function (newVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_ID); // getter
				else { // setter
					var oldVal = this.summonerId();

					localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);
					this.valueChanged('summonerId', oldVal);

					//this.cachedGameAvailable(false); // TODO: TEST
				}
			}, false),
			/** @type {string}
			 * @propterty */
			server: can.compute(function (newVal) {
				if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION); // getter
				else { // setter
					var oldVal = this.server();
					localStorage.setItem(SettingsModel.STORAGE_KEY_REGION, newVal);
					this.valueChanged('server', oldVal);

					//this.cachedGameAvailable(false); // TODO: TEST
				}
			}),
			/** @type {boolean}
			 * @propterty */
			startMatchCollapsed: can.compute(function (newVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED) == 'true';
				} else { // setter
					var oldVal = this.startMatchCollapsed();

					this.valueChanged('startMatchCollapsed', oldVal);

					if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED);
					else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED, newVal);
				}
			}),
			/** @type {boolean}
			 * @propterty */
			isFpsStable: can.compute(function (newVal) {
				if (newVal == undefined) {
					return localStorage.getItem(SettingsModel.STORAGE_KEY_FRAME_RATE) === 'true';
				} else { // setter
					localStorage.setItem(SettingsModel.STORAGE_KEY_FRAME_RATE, newVal);
				}
			}),
			/** @type {boolean}
			 * @propterty */
			isInGame: can.compute(function (newVal) {
				if (newVal == undefined) {
					return this.constructor.isInGame();
				} else { // setter
					var oldVal = this.constructor.isInGame();
					this.valueChanged('isInGame', oldVal);
					if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_IN_GAME);
					else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_IN_GAME, newVal);
				}
			}),
			/** @type {boolean}
			 * @propterty */
			isReloading: can.compute(function (newVal) {
				if (newVal == undefined) {
					return this.constructor.isReloading();
				} else { // setter
					var oldVal = this.constructor.isReloading();
					this.valueChanged('isReloading', oldVal);
					if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_RELOADING);
					else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_RELOADING, newVal);
				}
			}),
			/** @type {boolean}
			 * @propterty */
			startWithGame: can.compute(function (newVal) {
				if (newVal == undefined) {
					return this.constructor.startWithGame();
				} else { // setter
					var oldVal = this.constructor.startWithGame();
					this.valueChanged('startWithGame', oldVal);
					if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_WITH_GAME);
					else if (newVal !== oldVal) {
						localStorage.setItem(SettingsModel.STORAGE_KEY_START_WITH_GAME, newVal);
					}

					if (this.changedPropsOriginalValues['startWithGame'] === newVal) { // to remove the message again if changed back
						this.attr('startWithGameMessage', null);
					} else {
						this.attr('startWithGameMessage', 'Changed autostart setting will take effect after overwolf restart.'); // TODO: enable this for multiple messages if neccessary (message-bag)
					}
				}
			}),
			startWithGameInfo: '<p class="padded-bot-half">Uncheck if you want to disable this app to start automatically.<br><span style="text-decoration: underline">Requires overwolf restart!</span></p>',
			startWithGameMessage: null,

			/** @type {boolean}
			 * @propterty */
			closeMatchWithGame: can.compute(function (newVal) {
				if (newVal == undefined) {
					return this.constructor.closeMatchWithGame();
				} else { // setter
					var oldVal = this.constructor.closeMatchWithGame();
					this.valueChanged('closeMatchWithGame', oldVal);
					if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_CLOSE_MATCH_WITH_GAME);
					else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_CLOSE_MATCH_WITH_GAME, newVal);
				}
			}),
			closeMatchWithGameInfo: '<p>Uncheck if you want to finish reading about the champions after you left the game.</p>',

			/**
			 * @property
			 * @type {string}
			 */
			cachedGameId: can.compute(function (newVal) {
				if (newVal == undefined) { // getter
					return localStorage.getItem('temp_gameId');
				} else { // setter
					var oldVal = this.cachedGameId();
					this.valueChanged('cachedGameId', oldVal);
					if (newVal == false) localStorage.removeItem('temp_gameId');
					else if (newVal !== oldVal) localStorage.setItem('temp_gameId', newVal);
				}
			}),
			/**
			 * @property
			 * @type {boolean}
			 */
			cachedGameAvailable: can.compute(function (newVal) {
				if (newVal == undefined) { // getter
					return localStorage.getItem('lock_getCachedGame') == 'true';
				} else { // setter
					var oldVal = this.cachedGameAvailable();
					this.valueChanged('cachedGameId', oldVal);
					if (newVal == false) localStorage.removeItem('lock_getCachedGame');
					else if (newVal !== oldVal) localStorage.setItem('lock_getCachedGame', newVal);
				}
			}),

			/**
			 * Loads Hotkeys from the overwolf settings and stores them
			 * into the SettingsModel instance as attr('hotkeys')
			 * @return  {null} Promise that gets resolved after Hotkeys has been set for this.attr('hotkeys'). Does not resolve into any value
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
			///**
			// * rturns a new instance with all the .attr() copied into it
			// * @return {SettingsModel}
			// */
			//clone: function () {
			//	var data = this.attr();
			//	delete data[this.constructor.id];
			//	return new this.constructor(data);
			//	// TODO: does this still somewhat work? Don't think so since its not a real can.Model anymore
			//},
			///**
			// * sets all attr() from the given Model in this instance
			// * @param settingsModel
			// */
			//copyFrom: function (settingsModel) {
			//	for (var attrKey in settingsModel.attr()) {
			//		this.attr(attrKey, settingsModel.attr(attrKey));
			//	} // TODO: does this still somewhat work? Don't think so since its not a real can.Model anymore
			//},
			/**
			 * restores the original-values for this settingsModel Object
			 * by calling the setters with the original values
			 */
			reset: function () {
				for (var prop in this.changedPropsOriginalValues) {
					this[prop](this.changedPropsOriginalValues[prop]);
				}
			},
			/** If the given propName wasn't changed already, oldVal gets stored under the propName as key */
			valueChanged: function (propName, oldVal) {
				if (this.changedPropsOriginalValues[propName] == undefined) {
					this.changedPropsOriginalValues[propName] = oldVal;
				}
			}
		});
		return SettingsModel;
	});
