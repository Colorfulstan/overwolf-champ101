'use strict';

var RIOT_ADAPTER_URL_V2 = "http://api.champ101.krispin.it/v2.php";
var LB_API_URL = "http://legbuilds.overwolf.co";
var CHANGELOG_URL = "http://changelog.champ101.krispin.it/changelog.php";

var DDRAGON_BASE_URL = "http://ddragon.leagueoflegends.com/cdn/";
var DDRAGON_URL = undefined; // gets set from MatchDAO after loading the current Version-number
var LOL_PATCH = undefined; // gets set from MatchDAO after loading the current Version-number

var CDN_CLIENT_ABILITIES_URL = 'http://d28xe8vt774jo5.cloudfront.net/champion-abilities/';

var ANIMATION_SLIDE_SPEED_PER_PANEL = 400;