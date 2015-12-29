/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for main.html
// Only gets executed with the first start after overwolf restart
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'MainCtrl.js'
	, 'SettingsModel.js'
	, 'SettingsProvider.js'
	, 'Boot.js'
	, 'analytics.js'
	, function (/** MainCtrl */ MainCtrl
		, /** SettingsModel*/ SettingsModel
		, /** SettingsProvider */ Settings
		, /** Boot */ Boot,
				analytics) {

		analytics.init();

		WindowCtrl.enableStorageEvents();

		var main = new MainCtrl('html');
		var settings = Settings.getInstance();

		var firstStart = !SettingsModel.isSummonerSet();  // localStorage has no items on first start

		Boot.strap(main, settings, firstStart);

	});


