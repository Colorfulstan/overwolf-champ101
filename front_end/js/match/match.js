// Entry point for match.html
"use strict";
var MatchCtrl = require('./MatchCtrl');
var SettingsModel = require('../settings/SettingsModel');
var OverviewCtrl = require('./overview/OverviewCtrl');
var ChampionCtrl = require('./champion/ChampionCtrl');
//var Routing = require('./champion/Routing');


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

//var champPanelRouting = new Routing(document.body);


//champPanelRouting.setCtrl(champions);
//champPanelRouting.ready();
