"use strict";
var can = require('can');
var Routes = {
	// TooltipCtrl
	tooltipChampion: 'tooltip/champ/:champ',
	tootltipSpell: 'tooltip/champ/:champ/:index',

	// MatchCtrl
	/** Toggles all Panels */
	togglePanels: 'toggle/all',
	/** removes the panel with given id (0 = uppermost panel) */
	closePanel: 'close/panel/:id',

	// ChampionCtrl
	panelChampion: 'add/:champ',
	panelTeam: 'show/:team',

	// OverviewController
	reloadMatch: 'reload/match',

	// WindowController
	openWindow: 'open/:window',
	closeWindow: 'close/:window',
	minimizeWindow: 'minimize/:window',
	restoreWindow: 'restore/:window',
	refreshWindow: 'refresh/:window'

};

// TooltipCtrl
can.route('#!' + Routes.tooltipChampion);
can.route('#!' + Routes.tootltipSpell);

// MatchCtrl
can.route('#!' + Routes.closePanel);


// ChampionCtrl
can.route('#!' + Routes.togglePanels);
can.route('#!' + Routes.panelChampion);
can.route('#!' + Routes.panelTeam);

// OverviewCtrl
can.route('!#' + Routes.reloadMatch);

// WindowController
can.route('!#' + Routes.openWindow);
can.route('!#' + Routes.closeWindow);
can.route('!#' + Routes.minimizeWindow);
can.route('!#' + Routes.restoreWindow);
can.route('!#' + Routes.refreshWindow);


can.route.ready();


module.exports = Routes;