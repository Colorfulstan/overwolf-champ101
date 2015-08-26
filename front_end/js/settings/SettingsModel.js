"use strict";
require('../constants');
var Model = require('can/model/');

var Settings = Model.extend('Settings', {
	init: function () {

		this.STORAGE_KEY_REGION = 'region-code';
		this.STORAGE_KEY_NAME = 'summoner-name';
		this.STORAGE_KEY_ID = 'summoner-id';

		this.attr('summonerName', this._summonerName());
		this.attr('summonerId', this._summonerId());
		this.attr('server', this._server());

		this.bind('summonerName', this._summonerName);
		this.bind('summonerId', this._summonerId);
		this.bind('server', this._server);

	},
	/** @private */
	_server: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(this.STORAGE_KEY_REGION);
		if (newVal !== oldVal) localStorage.setItem(this.STORAGE_KEY_REGION, newVal);
	},
	/** @private */
	_summonerName: function (ev, newVal, oldVal) {
		if (newVal == undefined) return localStorage.getItem(this.STORAGE_KEY_NAME);
		if (newVal !== oldVal) localStorage.setItem(this.STORAGE_KEY_NAME, newVal);
	},
	/** @private */
	_summonerId: function (ev, newVal, oldVal) {
		if (newVal == undefined)return localStorage.getItem(this.STORAGE_KEY_ID);
		if (newVal !== oldVal) localStorage.setItem(this.STORAGE_KEY_ID, newVal);
	},
	// Todo: need??
	clearSummonerId: function () {
		return localStorage.removeItem(this.STORAGE_KEY_ID)
	},
	isSummonerSet: function () {
		return localStorage.getItem(this.STORAGE_KEY_ID);
	}
});
module.exports = Settings;