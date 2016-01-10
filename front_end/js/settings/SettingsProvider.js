"use strict";
import SettingsModel from 'SettingsModel';

/** @class SettingsProvider */
var SettingsProvider = function SettingsProvider() {
};

SettingsProvider.instance = null;
SettingsProvider.getInstance = function SettingsProviderGetInstance() {
	if (!SettingsProvider.instance) {
		SettingsProvider.instance = new SettingsModel();
	}
	SettingsProvider.instance.changedPropsOriginalValues = {};
	return SettingsProvider.instance;
};
SettingsProvider.getClassObj = function SettingsProviderGetClassObj() {
	return SettingsModel;
};

export default SettingsProvider; // TODO: export instance and class