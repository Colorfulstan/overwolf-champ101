"use strict";
import can from 'can';
import 'global';

/**
 * @class {can.Map} SettingsModel
 * @extends {can.Map}
 * @constructor {@link SettingsModel.init}
 */
var SettingsModel = can.Map.extend('SettingsModel', {
	STORAGE_KEY_REGION: 'region-code',
	STORAGE_KEY_NAME: 'summoner-name',
	STORAGE_KEY_ID: 'summoner-id',
	STORAGE_KEY_RELOADING: 'setting-manual-reload',
	STORAGE_KEY_IN_GAME: 'setting-in-game',
	STORAGE_KEY_START_WITH_GAME: 'setting-start-with-game',
	STORAGE_KEY_CLOSE_MATCH_WITH_GAME: 'setting-close-match-with-game',
	STORAGE_KEY_START_MATCH_COLLAPSED: 'setting-start-match-collapsed',
	STORAGE_KEY_MATCH_WINDOW_ON_SIDE: 'setting-match-position',
	STORAGE_FPS_STABLE: 'setting-fps-stable',
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
		if (typeof newVal === 'undefined') { // getter
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
	isManualReloading: function () {
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
		 * @type {{propName: string, originialValue: * }} */
		this.changedPropsOriginalValues = {};

		// NOTE: this.attr('hotkeys') gets initialized externally within settings.js
	},

	/** @type {string}
	 * @property */
	summonerName: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME); // getter
		else if (newVal === null) {localStorage.removeItem(SettingsModel.STORAGE_KEY_REGION)} // reset
		else { // setter
			var oldVal = this.summonerName();
			this.valueChanged('summonerName', oldVal);

			localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
			//this.cachedGameAvailable(false); // TODO: TEST
		}
	}, this),
	/** @type {string}
	 * @propterty */
	summonerId: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') return localStorage.getItem(SettingsModel.STORAGE_KEY_ID); // getter
		if (newVal === null) localStorage.removeItem(SettingsModel.STORAGE_KEY_ID);
		else { // setter
			var oldVal = this.summonerId();

			this.valueChanged('summonerId', oldVal);
			localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);

			//this.cachedGameAvailable(false); // TODO: TEST
		}
	}, false),
	/** @type {string}
	 * @propterty */
	server: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION); // getter
		else if (newVal === null) {localStorage.removeItem(SettingsModel.STORAGE_KEY_REGION)} // reset
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
		if (typeof newVal === 'undefined') {
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
		if (typeof newVal === 'undefined') {
			return localStorage.getItem(SettingsModel.STORAGE_FPS_STABLE) === 'true';
		} else { // setter
			localStorage.setItem(SettingsModel.STORAGE_FPS_STABLE, newVal);
		}
	}),
	/** @type {boolean}
	 * @propterty */
	isInGame: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.isInGame();
		} else { // setter
			var oldVal = SettingsModel.isInGame();
			this.valueChanged('isInGame', oldVal);
			if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_IN_GAME);
			else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_IN_GAME, newVal);
		}
	}),
	/** @type {boolean}
	 * @propterty */
	isManualReloading: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.isManualReloading();
		} else { // setter
			var oldVal = SettingsModel.isManualReloading();
			this.valueChanged('isManualReloading', oldVal);
			if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_RELOADING);
			else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_RELOADING, newVal);
		}
	}),
	/** @type {boolean}
	 * @propterty */
	startWithGame: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.startWithGame();
		} else { // setter
			var oldVal = SettingsModel.startWithGame();
			this.valueChanged('startWithGame', oldVal);
			if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_WITH_GAME);
			else if (newVal !== oldVal) {
				localStorage.setItem(SettingsModel.STORAGE_KEY_START_WITH_GAME, newVal);
			}

			if (this.changedPropsOriginalValues['startWithGame'] === newVal) { // to remove the message again if changed back
				this.attr('startWithGameMessage', null);
			} else {
				this.attr('startWithGameMessage', 'Changed autostart setting will restart the App.'); // TODO: enable this for multiple messages if neccessary (message-bag)
			}
		}
	}),
	startWithGameInfo: '<p class="padded-bot-half">Uncheck if you want to prevent this app from starting automatically.</p>',
	startWithGameMessage: null,

	/** @type {boolean}
	 * @propterty */
	closeMatchWithGame: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.closeMatchWithGame();
		} else { // setter
			var oldVal = SettingsModel.closeMatchWithGame();
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
		if (typeof newVal === 'undefined') { // getter
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
		if (typeof newVal === 'undefined') { // getter
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
	/**
	 * restores the original-values for this settingsModel Object
	 * by calling the setters with the original values
	 */
	reset: function () {
		// TODO: use http://canjs.com/docs/can.Map.backup.html ???
		for (var prop in this.changedPropsOriginalValues) {
			this[prop](this.changedPropsOriginalValues[prop]);
		}
		this.changedPropsOriginalValues = {};
	},
	/** If the given propName wasn't changed already, oldVal gets stored under the propName as key */
	valueChanged: function (propName, oldVal) {
		if (typeof this.changedPropsOriginalValues[propName] === 'undefined') {
			this.changedPropsOriginalValues[propName] = oldVal;
		}
	},
	hasValueChanged: function (propName) {
		return (typeof this.changedPropsOriginalValues[propName] !== 'undefined' && this.changedPropsOriginalValues[propName] !== this[propName]());
	}
});
export default SettingsModel;
