"use strict";
var Control = require('can/control/');
var ChampionModel = require('../champion/ChampionModel');
var SpellModel = require('../spell/SpellModel');
/**
 * Controls the tooltip-container
 * To show a tooltip use can.route.attr()
 * with respective route, name and y attributes
 *
 * @example
 * <b>Champion Tooltip:</b>
 * <pre>
 * can.route.attr({
			route: 'tooltip/champ/:name',
			name: $el.attr('alt'),
			y: $el.offset().y + $el.height()
		});
 *
 *can.route.attr({
			route: 'tooltip/champ/:name',
			name: null
		});</pre>
 * <b>Spell Tooltip:</b>
 * <pre>
 * can.route.attr({
 *			route: 'tooltip/spell/:name',
 *			name: $el.attr('alt'),
 *			y: $el.offset().y + $el.height()
 *	});</pre>
 *
 */
var TooltipCtrl = can.Control({
	/**
	 *
	 * @param element
	 * @param options
	 * @param {participantsByChamp } options.champions - Participants with their champions as keys
	 */
	init: function (element, options) {
	},


	hideTooltip: function () {
		this.element.html('');
		this.element.hide();
	},
	/**
	 * shows a Tooltip
	 * @param type {String} - 'spell' or 'champ'
	 * @param routeData {Object}
	 * @param routeData.champ {String}
	 * @param [routeData.spell] {String}
	 * @param routeData.y {number} - The y position from top of the screen for the tooltip
	 */
	showTooltip: function (type, routeData) {
		switch (type){
			case 'spell':
				var spell = this.options.champions[routeData.champ];

				break;
			case 'champ':

				break;
		}

	},
	'tooltip/champ/:champ route': function (routeData) {
		if (routeData.champ){
			this.showTooltip('champ', routeData);
		} else { this.hideTooltip(); }
	},
	'tooltip/spell/:champ/:spell route': function (routeData) {
		if (routeData.champ && routeData.spell){
			this.showTooltip('spell', routeData);
		} else { this.hideTooltip(); }
	}

});
module.exports = TooltipCtrl;