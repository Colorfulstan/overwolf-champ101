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
			can.view('../../../../views/match-overview.mustache', {blue: this.options.blue, purple: this.options.purple})
		);
	},

	//'.portrait mouseenter': function ($el, ev) {
	//	// TODO: open Tooltip
	//	this.options.portraitMouseenterHandler();
	//},
	//'.portrait mouseout': function () {
	//	// TODO: close Tooltip
	//	this.options.portraitMouseoutHandler();
	//},
	//'.portrait click': function () {
	//	// TODO: add panel Tooltip
	//	this.options.portraitClickHandler();
	//}
	//loadOverview : function () {
	//}
});
module.exports = OverviewCtrl;