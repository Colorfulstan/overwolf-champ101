"use strict";
/**
 * Model for a Tooltip-Window
 * @see TooltipModel.init
 */
var TooltipModel = can.Model({},{
	/**
	 *
	 * @param {Number} y Position of the Tooltip relative to upper screen Edge
	 */
	init: function (y) {
		this.y = y;
	}
});
module.exports = TooltipModel;