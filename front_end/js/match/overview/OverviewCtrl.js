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
		can.route.attr({
			route: 'tooltip/champ/:champ',
			champ: $el.attr('alt'),
			y: $el.offset().y + $el.height()
		});
	},
	'.portrait mouseout': function ($el, ev) {
		// TODO: close Tooltip
		can.route.attr({
			route: 'tooltip/champ/:champ',
			champ: null
		});
	},
	'.portrait click': function ($el, ev) {
		can.route.attr({route: 'add/:champ', champ: $el.attr('alt')});
	}
	//loadOverview : function () {
	//}
});
module.exports = OverviewCtrl;