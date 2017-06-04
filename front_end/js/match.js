/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
import Hotkeys from 'Hotkeys';
import MatchDAO from 'MatchDAO';
import MatchModel from 'MatchModel';
import Settings from 'SettingsProvider';
import WindowCtrl from 'WindowCtrl';
import MatchCtrl from 'MatchCtrl';
import Routes from 'Routes';
import analytics from 'analytics';

import {OwIoLolService} from 'ow.io.lol.service'
import {OwSimpleIOPluginService} from 'ow.simpleIOPlugin.service'
const owIoLolService = new OwIoLolService(console, overwolf, new OwSimpleIOPluginService(console))

steal.dev.log('match.js starts ..........');
analytics.init();

Routes.ready();
Hotkeys.registerHotkeys();

var dao = new MatchDAO();
var settings = Settings.getInstance();

var match = new MatchModel(settings.server());
var preloadMatchBeforeShowing = settings.isGameRunning() && ( !settings.isManualReloading() && settings.isWaitingForStableFps());
owIoLolService.simpleIOPlugin.refreshingPlugin().then(function () {
	if (preloadMatchBeforeShowing) { // ingame == preload data // TODO: seems to make no difference in both conditions!
		steal.dev.log('preloading data');
		dao.loadMatchModel(match, owIoLolService).always(function (matchPromise) { // TODO: currently not accounting for manual starts!?
			new MatchCtrl('html', {dao: dao, model: matchPromise, settings: settings});
		});
	} else { // else == show match with promise (handled within MatchCtrl)
		steal.dev.log('not preloading data');
		var matchPromise = dao.loadMatchModel(match, owIoLolService);
		new MatchCtrl('html', {dao: dao, model: matchPromise, settings: settings}); // window will open while Data is still loading
		settings.isManualReloading(false);
	}
})