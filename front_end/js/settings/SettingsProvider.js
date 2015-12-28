"use strict";
steal(
	'SettingsModel.js'
	, function (/**SettingsModel*/ SettingsModel) {

			/** @class SettingsProvider */
		var SettingsProvider = function SettingsProvider() {
		};

		SettingsProvider.instance = null;
		SettingsProvider.getInstance = function SettingsProviderGetInstance() {
			if (!SettingsProvider.instance) {
				SettingsProvider.instance = new SettingsModel();
			}
			return SettingsProvider.instance;
		};

		return SettingsProvider;
	});