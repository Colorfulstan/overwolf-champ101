/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Entry point for main.html
// Only gets executed with the first start after overwolf restart
/////////////////////////////////////////////////////////////////////////////////////////////////////////
"use strict";
import WindowCtrl from 'WindowCtrl';
import MainCtrl from 'MainCtrl';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import Boot from 'Boot';
import analytics from 'analytics';

analytics.init();
WindowCtrl.enableStorageEvents();

var main = new MainCtrl('html');
var settings = Settings.getInstance();

var firstStart = !SettingsModel.isFirstStart();  // localStorage has no items on first start

Boot.strap(main, settings, firstStart);


