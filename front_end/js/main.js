/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for main.html
// Only gets executed with the first start after overwolf restart
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'MainCtrl.js'
	, 'SettingsModel.js'
	, 'Boot.js'
	, function (/** MainCtrl */ MainCtrl
		, /** SettingsModel*/ SettingsModel
		, /** Boot */ Boot) {

		var main = new MainCtrl('html');
		var settings = new SettingsModel();

		var firstStart = !SettingsModel.isSummonerSet();  // localStorage has no items on first start

		Boot.strap(firstStart, settings);

		// TODO: all that follows belongs in an object / controller / whatever to be able to test it

	});


