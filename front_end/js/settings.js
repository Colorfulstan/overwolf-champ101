/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for settings.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
import WindowCtrl from 'WindowCtrl';
import SettingsCtrl from 'SettingsCtrl';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import Routes from 'Routes';
import analytics from 'analytics';

analytics.init();

WindowCtrl.enableStorageEvents();
Routes.ready();

var settings = Settings.getInstance();
steal.dev.log('Settings initialized:', settings);

$.when(settings.loadHotKeys()).then(function () {
	new SettingsCtrl('html', {settings: settings});
});
