/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'Hotkeys.js'
	, 'MatchDAO.js'
	, 'MatchModel.js'
	, 'SettingsModel.js'
	, 'MatchCtrl.js'
	, 'Routes.js'
	, function (Hotkeys
		, /**MatchDAO*/ MatchDAO
		, /**MatchModel*/ MatchModel
		, /**SettingsModel*/ SettingsModel
		, /** MatchCtrl */ MatchCtrl
		, /** Routes */ Routes) {

		Routes.ready();
		Hotkeys.registerHotkeys();

		var dao = new MatchDAO();
		var model = new MatchModel();
		var settings = new SettingsModel();

		new MatchCtrl('html', {dao: dao, model: model, settings: settings});

	});

