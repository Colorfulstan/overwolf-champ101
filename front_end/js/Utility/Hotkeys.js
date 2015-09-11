var can = require('can');

var Hotkeys = function(){};
Hotkeys.registerHotkeys = function () {
	overwolf.settings.registerHotKey("toggle_panels", function (result) {
		steal.dev.log('Hotkey toggle_panels pressed', result);
		if (result.status == "success") {
			can.route.attr({'route': 'toggle/all'});
			steal.dev.log('can route after hitting toggle_panels', can.route.attr());
		}
	});
	var team_handler = function (result, team) {
		steal.dev.log('Hotkey open_panel_team_' + team + ' pressed', result);
		if (result.status == "success") {
			can.route.attr({'route': 'show/:team', 'team': team});
		}
	};
	overwolf.settings.registerHotKey("open_panels_team_blue", function (result) {
		team_handler(result, 'blue');
	});
	overwolf.settings.registerHotKey("open_panels_team_purple", function (result) {
		team_handler(result, 'purple');
	});
	// TODO: open / close Match implementation - should not reload data but show/hide the matchwindow
	//overwolf.settings.registerHotKey("open_match", function (result) {
	//	team_handler(result, 'blue');
	//});

	function create_handler(id){
		return function close_panel_handler(result) {
			steal.dev.log('Hotkey close_panel_' + id + ' pressed', result, 'with id:' + id);
			if (result.status == "success") {
				can.route.attr({'route': 'close/panel/:id', 'id': id});
				steal.dev.log('close_panel_handler route nach Hotkey:', can.route.attr());
			}
		}
	}
	var funcs = [];
	for (var i = 0; i < 5; i++) {
		funcs[i] = create_handler(i);
	}
	for (var j = 0; j < 5; j++) {
		overwolf.settings.registerHotKey("close_panel_" + (j+1), funcs[j]);
		steal.dev.log('registered close_panel_' + (j+1));
	}
};
module.exports = Hotkeys;