/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
steal(
	'Hotkeys.js'
	, 'MatchDAO.js'
	, 'MatchModel.js'
	, 'SettingsModel.js'
	, 'SettingsProvider.js'
	, 'WindowCtrl.js'
	, 'MatchCtrl.js'
	, 'Routes.js'
	, 'analytics.js'

	, function (Hotkeys
		, /**MatchDAO*/ MatchDAO
		, /**MatchModel*/ MatchModel
		, /**SettingsModel*/ SettingsModel
		, /**SettingsProvider*/ Settings
		, /** WindowCtrl */ WindowCtrl
		, /** MatchCtrl */ MatchCtrl
		, /** Routes */ Routes
		, analytics) {

		analytics.init();

		WindowCtrl.enableStorageEvents();
		Routes.ready();
		Hotkeys.registerHotkeys();

		var dao = new MatchDAO();
		var settings = Settings.getInstance();

		var match = new MatchModel(settings.summonerId(), settings.server());
		if (!SettingsModel.isSummonerSet()) {
			WindowCtrl.closeMatch();
			return false;
		}
		var preloadMatchBeforeShowing = settings.isInGame() && !settings.isManualReloading();
		if (preloadMatchBeforeShowing) { // ingame == preload data
			steal.dev.log('preloading data');
			dao.loadMatchModel(match).always(function (matchPromise) { // TODO: currently not accounting for manual starts!?
				new MatchCtrl('html', {dao: dao, model: matchPromise, settings: settings});
			});
		} else { // else == show match with promise (handled within MatchCtrl)
			steal.dev.log('not preloading data');
			var matchPromise = dao.loadMatchModel(match);
			new MatchCtrl('html', {dao: dao, model: matchPromise, settings: settings}); // window will open while Data is still loading
			settings.isManualReloading(false);
		}
	}
)
;

