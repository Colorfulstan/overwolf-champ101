/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for settings.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'WindowCtrl.js'
	, 'SettingsCtrl.js'
	, 'SettingsModel.js'
	, 'Routes.js'
	, function (/**WindowCtrl*/ WindowCtrl
		, /**SettingsCtrl*/ SettingsCtrl
		, /**SettingsModel*/ SettingsModel
		, /**Routes*/ Routes) {

		WindowCtrl.enableStorageEvents();
		Routes.ready();

		var settings = new SettingsModel();
		steal.dev.log('Settings initialized:', settings);

		$.when(settings.loadHotKeys()).then(function () {
			new SettingsCtrl('html', {settings: settings});
		});

		return settings;
	});