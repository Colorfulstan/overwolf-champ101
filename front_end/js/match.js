/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";

import Hotkeys from 'Hotkeys';
import MatchDAO from 'MatchDAO';
import MatchModel from 'MatchModel';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import WindowCtrl from 'WindowCtrl';
import MatchCtrl from 'MatchCtrl';
import Routes from 'Routes';
import analytics from 'analytics';

analytics.init();

WindowCtrl.enableStorageEvents();
Routes.ready();
Hotkeys.registerHotkeys();

var dao = new MatchDAO();
var settings = Settings.getInstance();

var match = new MatchModel(settings.summonerId(), settings.server());
if (!SettingsModel.isSummonerSet()) {
	WindowCtrl.closeMatch();
}else {
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


