"use strict";
var can = require('can');

can.route('#!tooltip/:champ');
can.route('#!add/:champ');
can.route('#!show/:team');

can.route.ready();