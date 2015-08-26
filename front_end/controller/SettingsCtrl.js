"use strict";
steal('can'
	, 'models/Settings.js'
	, 'controller/WindowCtrl.js'
	, function (can
	,Settings) {

	/**
	 * Controlller for the "Settings" view
	 */
	var SettingsCtrl = can.Control({
		init: function () {
			this._regionKey = 'region-code';
			this._nameKey = 'summoner-name';
			this._idKey = 'summoner-id';

			this.options.settings = new Settings();

		}
		, server: function (regionCode) {
			if (regionCode) {
				localStorage.setItem(this._regionKey, regionCode);
				return true
			}
			return localStorage.getItem(this._regionKey);
		}
		, summonerName: function (name) {
			if (name) {
				localStorage.setItem(this._nameKey, name);
				return true;
			}
			return localStorage.getItem(this._nameKey)
		}
		, summonerId: function (id) {
			if (id) {
				localStorage.setItem(this._idKey, id);
				return true;
			}
			return localStorage.getItem(this._idKey)
		}
		, clearSummonerId: function () {
			return localStorage.removeItem(this._idKey)
		}
		, isSummonerSet: function () {
			return localStorage.getItem(this._idKey);
		}
	});
		return SettingsCtrl;
});