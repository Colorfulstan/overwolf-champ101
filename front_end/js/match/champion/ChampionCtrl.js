"use strict";
var Control = require('can/control/');
var ChampionModel = require('./ChampionModel');
/**
 * @see ChampionCtrl.init
 */
var ChampionCtrl = can.Control({
	init: function () {

		this.options.blue = [];
		this.options.purple = [];

	},

	/** LeagueData
	 * @typedef {Object} LeagueData
	 * @property {Team} blue
	 * @property {Team} purple */

	/** LeagueDataSpell
	 * @typedef {Object} LeagueDataSpell
	 * @property {String} name
	 * @property {String} description
	 * @property {LeagueDataImage} image - sdsa
	 * // TODO: add more from backend and doc here
	 * */

 	/** LeagueDataImage
	 * @typedef {Object} LeagueDataImage
	 * @property {String} full: String
	 * @property {String} group: String
	 * @property {String} sprite:
	 * @property {Integer} h
	 * @property {Integer} w
	 * @property {Integer} x
	 * @property {Integer} y */

  	/** Team
	 * @propertyOf LeagueData
	 * @typedef {Object} Team
	 * @property {Champ} champ */

 	/** Champ
	 * @typedef {Object} Champ
	 * @property {String} name
	 * @property {String[]} allytips
	 * @property {String[]} enemytips
	 * @property  {{ LeagueDataImage }} image
	 * @property {{ name: String, description: String, image: LeagueDataImage }} passive
	 * @property {{ LeageDataSpell[] }} spells
	 */

	/**
	 * @param {LeagueData} data
	 */
	loadChampions: function (data) {
		var self = this;
		steal.dev.log("Data arrived at ChampionCtrl .loadChampions: ", data);
		steal.dev.log('ChampionCtrl champ data:', data);

		data.blue.map(function (el, index) {
			self.options.blue.push(new ChampionModel(el.champ));
		});
		data.purple.map(function (el, index) {
			self.options.purple.push(new ChampionModel(el.champ));
		});
	},

	'show/:team route': function () {
		steal.dev.warn(':team route triggered');
	},
	'add/:champ route': function(){
		steal.dev.warn(':champ route triggered');
	}

});
module.exports = ChampionCtrl;