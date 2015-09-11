"use strict";
var can = require('can');
/**
 * @see OverviewCtrl.init
 */
var OverviewCtrl = can.Control.extend('OverviewCtrl', {
	defaults: {
		overviewTmpl: 'templates/match-overview.mustache'
	}
}, {
	/**
	 *
	 * @param el
	 * @param options.match {MatchModel}
	 */
	init: function (el, options) {
		debugger;
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
	'.portrait mouseenter': function ($el, ev) {
		//steal.dev.log('.portrait mouseenter');
		can.route.attr({
			route: 'tooltip/champ/:champ',
			champ: $el.attr('title'),
			y: $el.offset().top + $el.height()
		});
	},
	'.portrait mouseout': function ($el, ev) {
		//steal.dev.log('.portrait mouseout');
		can.route.attr({
			route: 'tooltip/hide'
		});
	},
	'.portrait click': function ($el, ev) {
		//steal.dev.log('.portrait click');
		can.route.attr({route: 'add/:champ', champ: $el.attr('title')});
	},
	'reload/match route': function (routeData) {
		steal.dev.log('refresh Route triggered in OverviewCtrl');
		debugger;
		this.options.match = routeData.match;
		this.renderView(this.options.match.blue,this.options.match.purple);
	},
	'.show-team.blue click': function ($el, ev) {
		can.route.attr({team: 'blue', route: 'show/:team'});
		ev.stopPropagation();
	},
	'.show-team.purple click': function ($el, ev) {
		can.route.attr({team: 'purple', route: 'show/:team'});
		ev.stopPropagation();
	}
});
module.exports = OverviewCtrl;