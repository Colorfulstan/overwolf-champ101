/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'Hotkeys.js'
	, 'MatchDAO.js'
	, 'MatchModel.js'
	, 'SettingsModel.js'
	, 'WindowCtrl.js'
	, 'MatchCtrl.js'
	, 'Routes.js'
	, function (Hotkeys
		, /**MatchDAO*/ MatchDAO
		, /**MatchModel*/ MatchModel
		, /**SettingsModel*/ SettingsModel
		, /** WindowCtrl */ WindowCtrl
		, /** MatchCtrl */ MatchCtrl
		, /** Routes */ Routes) {

		WindowCtrl.enableStorageEvents();
		Routes.ready();
		Hotkeys.registerHotkeys();

		var dao = new MatchDAO();
		var settings = new SettingsModel();

		var model = new MatchModel(settings.summonerId(), settings.server());

		if (!SettingsModel.isSummonerSet()) {
			WindowCtrl.closeMatch();
			return false;
		}
		var preloadMatchBeforeShowing = settings.isInGame() && !settings.isManualReloading();
		if (preloadMatchBeforeShowing) { // ingame == preload data
			console.log('preloading data');
			dao.loadMatchModel(model).always(function (match) { // TODO: currently not accounting for manual starts!?
				new MatchCtrl('html', {dao: dao, model: match, settings: settings});
			});
		} else { // else == show match with promise (handled within MatchCtrl)
			console.log('not preloading data');
			var match = dao.loadMatchModel(model);
			new MatchCtrl('html', {dao: dao, model: match, settings: settings}); // window will open while Data is still loading
			settings.isManualReloading(false);
		}
	});

