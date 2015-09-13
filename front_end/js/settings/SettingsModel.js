"use strict";
require('global');
var can = require('can');

/**
 * @typedef SettingsModel
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
	}

}, {
	init: function () {
		this.attr('summonerName', this._summonerName());
		this.attr('summonerId', this._summonerId());
		this.attr('server', this._server());
		//this.attr('mouseOutTimeout', this._mouseOutTimeout());
		this.attr('hideHomeAtStart', this._hideHomeAtStart());
		this.attr('startMatchCollapsed', this._startMatchCollapsed());
		// NOTE: this.attr('hotkeys') gets initialized externally within settings.js

		this.bind('summonerName', this._summonerName);
		this.bind('summonerId', this._summonerId);
		this.bind('server', this._server);
		//this.bind('mouseOutTimeout', this._mouseOutTimeout);
		this.bind('hideHomeAtStart', this._hideHomeAtStart);
		this.bind('startMatchCollapsed', this._startMatchCollapsed);
		//this.bind('hotkeys', SettingsModel.getHotKeys());


		this.attr('hideHomeAtStartInfo', "This will prevent the Start Window to show up when you enter a Game");

		// TODO: Hotkey Änderung binden??

	},
	/** @private */
	_server: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION);
		if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_REGION, newVal);
	},
	/** @private */
	_summonerName: function (ev, newVal, oldVal) {
		if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME);
		if (newVal !== oldVal) {
			localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
		}
	},
	/** @private */
	_summonerId: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
		if (newVal !== oldVal) {
			localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);
		}
	},
	_hideHomeAtStart: function (ev, newVal, oldVal) {
		if (newVal == undefined) {
			return this.hideHomeAtStart();
		}
		if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_HOME_AT_START, newVal);
	},
	_startMatchCollapsed: function (ev, newVal, oldVal) {
		if (newVal == undefined) {
			debugger;
			return localStorage.getItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED) == 'true';
		}
		// localstorage entry gets removed for falsy statement
		if (newVal == false) localStorage.removeItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED);
		else if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_START_MATCH_COLLAPSED, newVal);
	},
	// Todo: need??
	//clearSummonerId: function () {
	//	return localStorage.removeItem(SettingsModel.STORAGE_KEY_ID)
	//},
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
	clone: function () {
		var data = this.attr();
		delete data[this.constructor.id];
		return new this.constructor(data);
	},
	copyFrom: function (settingsModel) {
		for (var attrKey in settingsModel.attr()) {
			debugger;
			this.attr(attrKey, settingsModel.attr(attrKey));
		}
	}
});
module.exports = SettingsModel;