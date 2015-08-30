// Entry point for match.html
"use strict";
var MatchCtrl = require('./MatchCtrl');
var SettingsModel = require('../settings/SettingsModel');
var OverviewCtrl = require('./overview/OverviewCtrl');
var ChampionCtrl = require('./champion/ChampionCtrl');
var TooltipCtrl = require('./tooltip/TooltipCtrl');

var match = new MatchCtrl('div#content');
var settings = new SettingsModel();

var dataPromise = match.loadMatch(settings.attr('summonerId'), settings.attr('server'));

var overview;
var champions = new ChampionCtrl('#champion-container');
$.when(dataPromise).then(function (data) {
	champions.loadChampions(data);
	overview = new OverviewCtrl('#match-overview-container', {
		blue: champions.options.blue,
		purple: champions.options.purple
	});
}); // TODO: reload-btn

var tooltip = new TooltipCtrl('#tooltip-container', { champions: champions.options.participantsByChamp });