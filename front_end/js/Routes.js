"use strict";
var can = require('can');

// TooltipCtrl
can.route('#!tooltip/champ/:champ');
can.route('#!tooltip/spell/:champ/:index');

// ChampionCtrl
can.route('#!add/:champ');
can.route('#!show/:team');

// OverviewCtrl
can.route('!#reload/:window');

can.route.ready();