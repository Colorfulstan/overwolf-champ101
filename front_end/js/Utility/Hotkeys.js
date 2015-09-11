var can = require('can');

var Hotkeys = function(){};
Hotkeys.registerHotkeys = function () {
	overwolf.settings.registerHotKey("toggle_panels", function (result) {
		steal.dev.log('Hotkey toggle_panels triggered', result);
		if (result.status == "success") {
			can.route.attr({'route': 'toggle/all'});
			steal.dev.log('can route after hitting toggle_panels', can.route.attr());
		}
	});
	var team_handler = function (result, team) {
		steal.dev.log('Hotkey open_panel_team_' + team + ' triggered', result);
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
	overwolf.settings.registerHotKey("close_panels", function (result) {
		steal.dev.log('Hotkey close_panels triggered', result);
		if (result.status == "success") {
			can.route.attr({'route': 'close/panel/all'});
			steal.dev.log('can route after hitting close_panels', can.route.attr());
		}
	});
	overwolf.settings.registerHotKey("toggle_match", function (result) {
		steal.dev.log('Hotkey toggle_match triggered', result);
		if (result.status == "success") {
			can.route.attr({'route': 'toggle/:window', 'window':'Match'});
			steal.dev.log('can route after hitting toggle_match', can.route.attr());
		}
	});
};
module.exports = Hotkeys;