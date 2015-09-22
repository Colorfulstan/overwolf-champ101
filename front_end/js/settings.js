/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for settings.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'SettingsCtrl.js'
	, 'SettingsModel.js'
	, 'Routes.js'
	, function (/**SettingsCtrl*/ SettingsCtrl
		, /**SettingsModel*/ SettingsModel
		, /**Routes*/ Routes) {
		Routes.ready();

		var settings = new SettingsModel();
		steal.dev.log('Settings initialized:', settings);

		$.when(settings.loadHotKeys()).then(function () {
			new SettingsCtrl('html', {settings: settings});
		});

		return settings;
	});