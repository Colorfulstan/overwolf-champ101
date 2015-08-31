// Entry point for index.html
"use strict";
var App = require('App');
var SettingsModel = require('SettingsModel');


var app = new App();
var settings = new SettingsModel();

app.start(settings.isSummonerSet());
