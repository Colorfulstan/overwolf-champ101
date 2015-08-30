"use strict";
var can = require('can');
/**
 * @see OverviewCtrl.init
 */
var OverviewCtrl = can.Control.extend('OverviewCtrl', {}, {
	/**
	 *
	 * @param el
	 * @param options.match {MatchModel}
	 */
	init: function (el, options) {
		this.renderView();
	},
	renderView: function () {
		steal.dev.log("rendering view for OverviewCtrl");

		this.element.html(
			can.view('./match-overview.mustache', {
				blue: this.options.match.blue,
				purple: this.options.match.purple
			})
		);
	},
	'.portrait mouseenter': function ($el, ev) {
		//steal.dev.log('.portrait mouseenter');
		can.route.attr({
			route: 'tooltip/champ/:champ',
			champ: $el.attr('alt'),
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
		can.route.attr({route: 'add/:champ', champ: $el.attr('alt')});
	},
	'reload/:window route': function () {
		steal.dev.log('reload Route triggered');
		this.renderView();
	}
});
module.exports = OverviewCtrl;