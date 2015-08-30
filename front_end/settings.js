// Entry point for settings.html
"use strict";
var SettingsCtrl = require('./js/settings/SettingsCtrl');
var SettingsModel = require('./js/settings/SettingsModel');

var settings = new SettingsModel();
steal.dev.log('Settings initialized:', settings);

new SettingsCtrl('div#content', {settings: settings});
