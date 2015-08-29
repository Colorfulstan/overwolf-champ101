"use strict";
var can = require('can');
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
 			route: 'tooltip/spell/:champ/:index',
 			name: $el.attr('alt'),
 			y: $el.offset().y + $el.height()
 	});</pre>
 *
 */
var TooltipCtrl = can.Control.extend({
	/**
	 *
	 * @param element
	 * @param options
	 * @param {MatchModel } options.match
	 */
	init: function (element, options) {
	},


	hideTooltip: function () {
		this.element.html('');
		this.element.hide();
	},
	/**
	 * shows a Tooltip
	 * @param type {String} - 'spell' || 'champ'
	 * @param routeData {Object}
	 * @param routeData.champ {String}
	 * @param [routeData.index] {number} index of the spell within the spell array of a given champ
	 * @param [routeData.type] {String} indicator for spell-type. Can be 'ability' || 'summoner'
	 * @param routeData.y {number} - The y position from top of the screen for the tooltip
	 */
	showTooltip: function (type, routeData) {
		switch (type){
			case 'spell':
				var spell;
				if (routeData.type == 'ability'){
					spell = this.options.match.participantsByChamp[routeData.champ].champ.spells[routeData.index];
				}
				if (routeData.type == 'passive'){
					spell = this.options.match.participantsByChamp[routeData.champ].champ.passive;
				}
				if (routeData.type == 'summoner'){
					spell = this.options.match.participantsByChamp[routeData.champ].summonerSpells[routeData.index];
				}
				this.element.html(
					can.view('./tooltip-spell.mustache', spell)
				);
				break;
			case 'champ':
				console.log('routeData.champ:', routeData.champ);
				var champ = this.options.match.participantsByChamp[routeData.champ].champ;
				this.element.html(
					can.view('./tooltip-champ.mustache', champ)
				);
				break;
		}

		this.element.css('top', routeData.y + 'px');
		this.element.show();
	},
	'tooltip/champ/:champ route': function (routeData) {
		steal.dev.log('tooltip route for champ triggered', routeData);
		if (routeData.champ){
			this.showTooltip('champ', routeData);
		} else { this.hideTooltip(); }
	},
	'tooltip/hide route': function () {
		this.hideTooltip();
	},
	'tooltip/spell/:champ/:index route': function (routeData) {
		steal.dev.log('tooltip route for spell triggered', routeData);
		if (routeData.champ !== null && routeData.index !== null){
			this.showTooltip('spell', routeData);
		} else { this.hideTooltip(); }
	}

});
module.exports = TooltipCtrl;