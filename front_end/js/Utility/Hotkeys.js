"use strict";
steal('can', 'Routes.js', function (can, Routes) {

	var Hotkeys = function () {};
	Hotkeys.registerHotkeys = function () {
		overwolf.settings.registerHotKey("toggle_panels", function (result) {
			steal.dev.log('Hotkey toggle_panels triggered', result);
			if (result.status == "success") {
				can.route.attr({'route': Routes.togglePanels});
				steal.dev.log('can route after hitting toggle_panels', can.route.attr());
			}
		});
		var team_handler = function (result, team) {
			steal.dev.log('Hotkey open_panel_team_' + team + ' triggered', result);
			if (result.status == "success") {
				can.route.attr({'route': Routes.panelTeam, 'team': team});
			}
		};
		overwolf.settings.registerHotKey("open_panels_team_blue", function (result) {
			team_handler(result, 'blue');
		});
		overwolf.settings.registerHotKey("open_panels_team_red", function (result) {
			team_handler(result, 'purple');
		});
		overwolf.settings.registerHotKey("close_panels", function (result) {
			steal.dev.log('Hotkey close_panels triggered', result);
			if (result.status == "success") {
				can.route.attr({'route': Routes.closeAllPanels});
				steal.dev.log('can route after hitting close_panels', can.route.attr());
			}
		});
		overwolf.settings.registerHotKey("toggle_match", function (result) {
			steal.dev.log('Hotkey toggle_match triggered', result);
			if (result.status == "success") {
				can.route.attr({'route': Routes.toggleWindow, 'window': 'Match'});
				steal.dev.log('can route after hitting toggle_match', can.route.attr());
			}
		});
	};
	return Hotkeys;
});