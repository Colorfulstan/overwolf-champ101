"use strict";
var Control = require('can/control/');
/**
 * @see OverviewCtrl.init
 */
var OverviewCtrl = can.Control({
	/**
	 *
	 * @param el
	 * @param options
	 * @param {Champ[]} options.blue
	 * @param {Champ[]} options.purple
	 * @param {Function} options.portraitClickHandler
	 * @param {Function} options.portraitMouseenterHandler
	 * @param {Function} options.portraitMouseoutHandler
	 */
	init: function (el, options) {
		this.element.html(
			can.view('../../../../views/match-overview.mustache', {
				blue: this.options.blue,
				purple: this.options.purple
			})
		);
	},

	'.portrait mouseenter': function ($el, ev) {
		// TODO: open Tooltip
		can.route.attr('route','tooltip/:champ');
		can.route.attr('tooltip',$el.attr('alt'));
	},
	'.portrait mouseout': function () {
		// TODO: close Tooltip
		can.route.attr('route','tooltip/:champ');
		can.route.attr('tooltip','');
	},
	'.portrait click': function ($el, ev) {
		can.route.attr({route: 'add/:champ', champ: $el.attr('alt'), clicked: $el.attr('alt')});
	}
	//loadOverview : function () {
	//}
});
module.exports = OverviewCtrl;