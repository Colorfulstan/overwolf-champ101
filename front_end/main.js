// Entry point for index.html
"use strict";
var App = require('./js/App');
var SettingsModel = require('./settings/SettingsModel');

var app = new App();
var settings = new SettingsModel();

app.start(settings.isSummonerSet());
