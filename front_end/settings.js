// Entry point for settings.html
"use strict";
var SettingsCtrl = require('SettingsCtrl');
var SettingsModel = require('SettingsModel');

var settings = new SettingsModel();
steal.dev.log('Settings initialized:', settings);

new SettingsCtrl('div#content', {settings: settings});
