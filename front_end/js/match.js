/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'Hotkeys.js'
	, 'MatchCtrl.js'
	, 'Routes.js'
	, function (Hotkeys
		, /** MatchCtrl */ MatchCtrl
		, /** Routes */ Routes) {

		Routes.ready();
		Hotkeys.registerHotkeys();
		var match = new MatchCtrl('html');
	});

