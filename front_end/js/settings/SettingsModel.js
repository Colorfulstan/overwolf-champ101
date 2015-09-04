"use strict";
require('global');
var can = require('can');

var SettingsModel = can.Model.extend('SettingsModel', {
	STORAGE_KEY_REGION: 'region-code',
	STORAGE_KEY_NAME: 'summoner-name',
	STORAGE_KEY_ID: 'summoner-id',
	STORAGE_KEY_HOME_AT_START: 'setting-home-at-startup',
	//MOUSEOUT_KEY_ID = 'mouse-out-timeout'

	}, {
	init: function () {

		this.attr('summonerName', this._summonerName());
		this.attr('summonerId', this._summonerId());
		this.attr('server', this._server());
		//this.attr('mouseOutTimeout', this._mouseOutTimeout());
		this.attr('hideHomeAtStart', this._hideHomeAtStart());

		this.bind('summonerName', this._summonerName);
		this.bind('summonerId', this._summonerId);
		this.bind('server', this._server);
		//this.bind('mouseOutTimeout', this._mouseOutTimeout);
		this.bind('hideHomeAtStart', this._hideHomeAtStart);

	},
	/** @private */
	_server: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_REGION);
		if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_REGION, newVal);
	},
	/** @private */
	_summonerName: function (ev, newVal, oldVal) {
		if (newVal == undefined) return localStorage.getItem(SettingsModel.STORAGE_KEY_NAME);
		if (newVal !== oldVal) {localStorage.setItem(SettingsModel.STORAGE_KEY_NAME, newVal);
	}
	},
	/** @private */
	_summonerId: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(SettingsModel.STORAGE_KEY_ID);
		if (newVal !== oldVal) {localStorage.setItem(SettingsModel.STORAGE_KEY_ID, newVal);
		}
	},
	//_mouseOutTimeout: function (ev, newVal, oldVal) {
	//	//if (newVal == undefined) return localStorage.getItem(SettingsModel.MOUSEOUT_KEY_ID);
	//	//if (newVal !== oldVal) localStorage.setItem(SettingsModel.MOUSEOUT_KEY_ID, newVal);
	//	return 1; // TODO: maybe implement as setting
	//},
	_hideHomeAtStart: function (ev, newVal, oldVal) {
		if (newVal == undefined) {return this.hideHomeAtStart();
		}if (newVal !== oldVal) localStorage.setItem(SettingsModel.STORAGE_KEY_HOME_AT_START, newVal);
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
	}
});
module.exports = SettingsModel;