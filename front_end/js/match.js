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
		var settings = new SettingsModel();

		var model = new MatchModel(settings.summonerId(), settings.server());

		if (settings.isInGame() && !settings.isReloading()) { // ingame == preload data
			dao.loadMatchModel(model).always(function (match) { // TODO: currently not accounting for manual starts!?
				new MatchCtrl('html', {dao: dao, model: match, settings: settings});
			});
		} else { // else == show match with promise (handled within MatchCtrl)
			var match = dao.loadMatchModel(model);
			new MatchCtrl('html', {dao: dao, model: match, settings: settings});
			settings.isReloading(false);
		}
	});

