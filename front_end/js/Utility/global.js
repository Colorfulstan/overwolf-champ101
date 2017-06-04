'use strict';

var API_URL = "http://legbuildstwitchnocdn.overwolf.com";
var CHAMPION_INFO_URL = API_URL + '/champ101';
var CHANGELOG_URL = "http://changelog.champ101.krispin.it/changelog.php";

var DDRAGON_BASE_URL = "http://ddragon.leagueoflegends.com/cdn/";
var DDRAGON_URL = undefined; // gets set from MatchDAO after loading the current Version-number
var LOL_PATCH = undefined; // gets set from MatchDAO after loading the current Version-number

var CDN_CLIENT_ABILITIES_URL = 'http://d28xe8vt774jo5.cloudfront.net/champion-abilities/';

var ANIMATION_SLIDE_SPEED_PER_PANEL = 400;