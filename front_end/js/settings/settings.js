// Entry point for settings.html
"use strict";
var SettingsCtrl = require('./SettingsCtrl');
var SettingsModel = require('../settings/SettingsModel');

var settings = new SettingsModel();
steal.dev.log('Settings initialized:', this.options.settings);

new SettingsCtrl('div#content', {settings: settings});
