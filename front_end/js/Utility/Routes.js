"use strict";
steal(
	'can'
	, function (/**can*/ can) {
		/**
		 * @class {Routes} Routes
		 * @static
		 * @readonly
		 * @typedef {Object} Routes
		 * */
		var Routes = {
			// TooltipCtrl
			tooltipChampion: 'tooltip/champ/:champ',
			tooltipSpell: 'tooltip/champ/:champ/:index',
			tooltipHide: 'tooltip/hide',

			// MatchCtrl
			/** Toggles all Panels */
			togglePanels: 'toggle/all',
			expandPanels: 'show/all',
			/** removes the panel with given id (0 = uppermost panel) */
			closePanel: 'close/panel/:id',
			closeAllPanels: 'close/panel/all',
			reloadMatch: 'reload/match',

			// ChampionCtrl
			panelChampion: 'add/:champ',
			panelTeam: 'show/:team',


			// WindowController
			openWindow: 'open/:window',
			closeWindow: 'close/:window',
			minimizeWindow: 'minimize/:window',
			restoreWindow: 'restore/:window',
			refreshWindow: 'refresh/:window',
			toggleWindow: 'toggle/:window',

			hasBeenReadied: false,

			/** initializes all available routes and calls can.route.ready() */
			ready: function () {

				// TooltipCtrl
				can.route('#!' + Routes.tooltipChampion);
				can.route('#!' + Routes.tooltipSpell);
				can.route('#!' + Routes.tooltipHide);

				// MatchCtrl
				can.route('#!' + Routes.closePanel);
				can.route('#!' + Routes.closeAllPanels);
				can.route('#!' + Routes.expandPanels);

				// ChampionCtrl
				can.route('#!' + Routes.togglePanels);
				can.route('#!' + Routes.panelChampion);
				can.route('#!' + Routes.panelTeam);

				// OverviewCtrl
				can.route('!#' + Routes.reloadMatch);

				// WindowController
				can.route('!#' + Routes.openWindow);
				can.route('!#' + Routes.closeWindow);
				can.route('!#' + Routes.minimizeWindow);
				can.route('!#' + Routes.restoreWindow);
				can.route('!#' + Routes.refreshWindow);
				can.route('!#' + Routes.toggleWindow);

				can.route.ready();
			}

		};

		Routes.setRouteData = function (routeData, replace) {
			if (typeof routeData !== 'object' || routeData.constructor === Array) {
				throw new Error('routeData: ' + routeData +' is not an object!');
			}
			var hasProperties = false;
			for(var prop in routeData) {
				if (routeData.hasOwnProperty(prop)) { hasProperties = true; }
			}
			if (!hasProperties){ throw new Error('routeData has no Properties!'); }


			var repl = replace || false;
			var def = $.Deferred();
			var promise = def.promise();
			window.setTimeout(function () {
				can.route.attr(routeData, repl);
				def.resolve();
			}, 1);
			return promise;
		};
		Routes.setRoute = function (route, replace) {
			return Routes.setRouteData({'route': route}, replace);
		};
		Routes.resetRoute = function () {
			return Routes.setRouteData({route: ''}, true);
		};
		Routes.attr = function(attr) {
			if (!attr){
				return can.route.attr();
			}
			return can.route.attr(attr);
		};
		return Routes;
	});