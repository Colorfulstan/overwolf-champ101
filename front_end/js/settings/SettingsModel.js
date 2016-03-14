"use strict";
import can from 'can';
import 'global';

function createInfoTextHtml(msg) {
		return '<p class="padded-bot-half">' + msg + '</p>';
}

/**
 * @class {can.Map} SettingsModel
 * @extends {can.Map}
 * @typedef SettingsModel
 * @constructor {@link SettingsModel.init}
 */
var SettingsModel = can.Map.extend('SettingsModel', {
	STORAGE_KEY_REGION: 'region-code',
	STORAGE_KEY_NAME: 'summoner-name',
	STORAGE_KEY_ID: 'summoner-id',
	STORAGE_KEY_RELOADING: 'setting-manual-reload',
	STORAGE_KEY_GAME_IS_RUNNING: 'setting-in-game',
	STORAGE_KEY_START_WITH_GAME: 'setting-start-with-game',
	STORAGE_KEY_FIRST_START_DATE: 'setting-first-start-at',
	STORAGE_KEY_CLOSE_MATCH_WITH_GAME: 'setting-close-match-with-game',
	STORAGE_KEY_START_MATCH_COLLAPSED: 'setting-start-match-collapsed',
	STORAGE_KEY_MATCH_WINDOW_ON_SIDE: 'setting-match-position',
	STORAGE_FPS_STABLE: 'setting-fps-stable',
	STORAGE_KEY_AWAIT_FPS: 'setting-wait-for-fps',
	//MOUSEOUT_KEY_ID = 'mouse-out-timeout'

	/** @static
	 * @return {Promise} resolves into the manifest JSON object of the app
	 * */
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
	getVersion: function () {
		var def = $.Deferred();
		SettingsModel.getManifest().then(function (manifest) {
			def.resolve(manifest.meta.version);
		});
		return def.promise();
	},
	/** @static */
	startWithGame: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_START_WITH_GAME) == 'true'
	},
	/** @static */
	closeMatchWithGame: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_CLOSE_MATCH_WITH_GAME) == 'true'
	},
	/** @static
	 * @deprecated will be removed in the future since Summoner gets fetched per game now.*/
	isSummonerSet: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
	},
	/** @static*/
	isFirstStart: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_FIRST_START_DATE) === null;
	},
	isMatchMinimized: function (newVal) {
		if (typeof newVal === 'undefined') { // getter
			return localStorage.getItem('lock_matchMinimized') == 'true';
		} else { // setter
			if (newVal == false) localStorage.removeItem('lock_matchMinimized');
			else if (newVal == true) localStorage.setItem('lock_matchMinimized', 'true');
		}
	},
	isWaitingForStableFps: function () {
		//return false;
		return localStorage.getItem(SettingsModel.STORAGE_KEY_AWAIT_FPS) == 'true';
	},
	/** @static */
	isGameRunning: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_GAME_IS_RUNNING) == 'true'
	},
	/** @static */
	isManualReloading: function () {
		return localStorage.getItem(SettingsModel.STORAGE_KEY_RELOADING) == 'true'
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
	 * @property
	 * @deprecated will be removed in the future since Summoner gets fetched per game now. */
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
	 * @propterty
	 * @deprecated Might be used for decision if player is watching replay or live game */
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
	 * @propterty*/
	firstStartDate: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') return localStorage.getItem(SettingsModel.STORAGE_KEY_FIRST_START_DATE); // getter
		if (newVal === null) localStorage.removeItem(SettingsModel.STORAGE_KEY_FIRST_START_DATE);
		else { // setter
			var oldVal = this.firstStartDate();

			this.valueChanged('firstStartDate', oldVal);
			localStorage.setItem(SettingsModel.STORAGE_KEY_FIRST_START_DATE, newVal);
		}
	}, false),
	/** @type {string}
	 * @propterty
	 * @deprecated Can be fetched dynamically */
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
	isGameRunning: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.isGameRunning();
		} else { // setter
			var oldVal = SettingsModel.isGameRunning();
			this.valueChanged('isGameRunning', oldVal);
			if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_GAME_IS_RUNNING);
			else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_GAME_IS_RUNNING, newVal);
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
	isWaitingForStableFps: can.compute(function (newVal) {
		if (typeof newVal === 'undefined') {
			return SettingsModel.isWaitingForStableFps();
		} else { // setter
			var oldVal = SettingsModel.isWaitingForStableFps();
			this.valueChanged('isWaitingForStableFps', oldVal);
			if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_AWAIT_FPS);
			else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_AWAIT_FPS, newVal);
		}
	}),
	isWaitingForStableFpsInfo: createInfoTextHtml("Uncheck if you want to open the Match-window as soon as possible. Expect lagging Animation during loading screen!"),
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
	startWithGameInfo: createInfoTextHtml('Uncheck if you want to prevent this app from starting automatically'),
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
	closeMatchWithGameInfo: createInfoTextHtml('Uncheck if you want to finish reading about the champions after you left the game.'),

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
