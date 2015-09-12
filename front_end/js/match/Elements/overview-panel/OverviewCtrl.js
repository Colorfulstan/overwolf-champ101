"use strict";
var can = require('can');
var Routes = require('Routes');

/**
 * @see OverviewCtrl.init
 */
var OverviewCtrl = can.Control.extend('OverviewCtrl', {
	defaults: {
		overviewTmpl: 'templates/match-overview.mustache',

		// handled routes
		reloadMatchRoute: Routes.reloadMatch
	}
}, {
	/**
	 *
	 * @param el
	 * @param options.match {MatchModel}
	 */
	init: function (el, options) {
		this.renderView(options.match.blue, options.match.purple);
	},
	renderView: function (teamBlue, teamPurple) {
		steal.dev.log("rendering view for OverviewCtrl");

		this.element.html(
			can.view(this.options.overviewTmpl, {
				blue: teamBlue,
				purple: teamPurple
			})
		);
	},
	// Eventhandler
	'{reloadMatchRoute} route': function (routeData) {
		steal.dev.log('refresh Route triggered in OverviewCtrl');
		debugger;
		this.options.match = routeData.match;
		this.renderView(this.options.match.blue,this.options.match.purple);
	},
	'.portrait mouseenter': function ($el, ev) {
		//steal.dev.log('.portrait mouseenter');
		can.route.attr({
			route: Routes.tooltipChampion,
			champ: $el.attr('title'),
			y: $el.offset().top + $el.height()
		});
	},
	'.portrait mouseout': function ($el, ev) {
		//steal.dev.log('.portrait mouseout');
		can.route.attr({
			route: Routes.tooltipHide
		});
	},
	'.portrait click': function ($el, ev) {
		//steal.dev.log('.portrait click');
		can.route.attr({route: Routes.panelChampion, champ: $el.attr('title')});
	},
	'.show-team.blue click': function ($el, ev) {
		can.route.attr({team: 'blue', route: Routes.panelTeam});
		ev.stopPropagation();
	},
	'.show-team.purple click': function ($el, ev) {
		can.route.attr({team: 'purple', route: Routes.panelTeam});
		ev.stopPropagation();
	}
});
module.exports = OverviewCtrl;