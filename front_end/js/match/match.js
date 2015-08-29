"use strict";
var SettingsModel = require('../settings/SettingsModel');
var OverviewCtrl = require('./overview-panel/OverviewCtrl');
var ChampionCtrl = require('./champion-panel/ChampionCtrl');
var TooltipCtrl = require('./tooltip/TooltipCtrl');
require('../Routes');

var MatchCtrl = require('./MatchCtrl');
var MatchDAO = require('./MatchDAO');
var MatchModel = require('./MatchModel');
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
	var overview = new OverviewCtrl('#match-overview-container', { match : match });
	// Controller for Champion-Panels
	var champions = new ChampionCtrl('#champion-container', { match : match });
	debugger;

	// Controller for Tooltip
	var tooltip = new TooltipCtrl('#tooltip-container', { match : match });
});
