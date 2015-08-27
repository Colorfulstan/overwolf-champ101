// Entry point for match.html
"use strict";
var MatchCtrl = require('./MatchCtrl');
var SettingsModel= require('../settings/SettingsModel');
var OverviewCtrl= require('./overview/OverviewCtrl');


var match = new MatchCtrl('div#content');
var settings = new SettingsModel();
var overview = new OverviewCtrl('#match-overview-container');


match.loadMatch(overview.element, settings.attr('summonerId'),settings.attr('server'));