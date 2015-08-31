"use strict";
var SettingsModel = require('./js/settings/SettingsModel');
var OverviewCtrl = require('./js/match/overview-panel/OverviewCtrl');
var ChampionCtrl = require('./js/match/champion-panel/ChampionCtrl');
var TooltipCtrl = require('./js/match/tooltip/TooltipCtrl');
require('./js/Routes');

var MatchCtrl = require('./js/match/MatchCtrl');
var MatchDAO = require('./js/match/MatchDAO');
var MatchModel = require('./js/match/MatchModel');
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for match.html
/////////////////////////////////////////////////////////////////////////////////////////////////////////



var settings = new SettingsModel();

var dao = new MatchDAO();
var match = new MatchModel();
match.attr('summonerId', settings.attr('summonerId'));
match.attr('server', settings.attr('server'));

// Overall Controller for this view
var matchCtrl = new MatchCtrl('div#content', {dao : dao, settings: settings});

var matchPromise = matchCtrl.loadMatch(match);


// After successfully loading the Match-Data
$.when(matchPromise).then(function (match) {

	// Controller for Overview-Panel
	new OverviewCtrl('#match-overview-container', { match : match });
	// Controller for Champion-Panels
	new ChampionCtrl('#champion-container', { match : match });

	// Controller for Tooltip
	new TooltipCtrl('#tooltip-container', { match : match });
});
