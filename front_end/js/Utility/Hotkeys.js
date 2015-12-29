"use strict";
steal('can', 'Routes.js', 'SettingsModel.js', 'analytics.js'
	, function (can, Routes, SettingsModel, analytics) {

		var Hotkeys = function () {};
		Hotkeys.registerHotkeys = function () {
			overwolf.settings.registerHotKey("toggle_match", function (result) {
				steal.dev.log('Hotkey toggle_match triggered', result);
				if (result.status == "success") {
					Routes.setRouteData({'route': Routes.toggleWindow, 'window': 'Match'});
					steal.dev.log('can route after hitting toggle_match', Routes.attr());
					analytics.event('Hotkey', 'use', 'toggle_match');
				}
			});
			overwolf.settings.registerHotKey("toggle_panels", function (result) {
				steal.dev.log('Hotkey toggle_panels triggered', result);
				if (result.status == "success") {
					if (!SettingsModel.isMatchMinimized()) {
						Routes.setRoute(Routes.togglePanels, true);
					} else {
						Routes.setRouteData({'route': Routes.restoreWindow, 'window': 'Match'}, true);
						Routes.setRoute(Routes.expandPanels, true);
					}
					steal.dev.log('can route after hitting toggle_panels', Routes.attr());
					analytics.event('Hotkey', 'use', 'toggle_panels');
				}
			});
			var team_handler = function (result, team) {
				steal.dev.log('Hotkey open_panel_team_' + team + ' triggered', result);
				if (result.status == "success") {
					Routes.setRouteData({'route': Routes.panelTeam, 'team': team});
				}
			};
			overwolf.settings.registerHotKey("open_panels_team_blue", function (result) {
				team_handler(result, 'blue');
				analytics.event('Hotkey', 'use', 'open_panels_team_blue');
			});
			overwolf.settings.registerHotKey("open_panels_team_red", function (result) {
				team_handler(result, 'purple');
				analytics.event('Hotkey', 'use', 'open_panels_team_red');
			});
			overwolf.settings.registerHotKey("close_panels", function (result) {
				steal.dev.log('Hotkey close_panels triggered', result);
				if (result.status == "success") {
					Routes.setRoute(Routes.closeAllPanels);
					steal.dev.log('can route after hitting close_panels', Routes.attr());
				}
				analytics.event('Hotkey', 'use', 'close_panels');
			});
		};
		return Hotkeys;
	});