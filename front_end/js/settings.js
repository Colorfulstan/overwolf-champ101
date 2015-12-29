/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for settings.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'WindowCtrl.js'
	, 'SettingsCtrl.js'
	, 'SettingsModel.js'
	, 'SettingsProvider.js'
	, 'Routes.js'
	, 'analytics.js'
	, function (/**WindowCtrl*/ WindowCtrl
		, /**SettingsCtrl*/ SettingsCtrl
		, /**SettingsModel*/ SettingsModel
		, /**SettingsProvider*/ Settings
		, /**Routes*/ Routes
		, analytics) {

		analytics.init();

		WindowCtrl.enableStorageEvents();
		Routes.ready();

		var settings = Settings.getInstance();
		steal.dev.log('Settings initialized:', settings);

		$.when(settings.loadHotKeys()).then(function () {
			new SettingsCtrl('html', {settings: settings});
		});

		return settings; // TODO: remove
	}
)
;