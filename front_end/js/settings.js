// Entry point for settings.html
"use strict";
var SettingsCtrl = require('SettingsCtrl');
var SettingsModel = require('SettingsModel');
require('Routes');

var settings = new SettingsModel();
steal.dev.log('Settings initialized:', settings);

$.when(settings.loadHotKeys()).then(function () {
	new SettingsCtrl('html', {settings: settings});
});
