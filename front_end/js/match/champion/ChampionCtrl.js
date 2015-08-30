"use strict";
var Control = require('can/control/');
var ChampionModel = require('./ChampionModel');
var SpellModel = require('./../spell/SpellModel');
/**
 * @see ChampionCtrl.init
 */
var ChampionCtrl = Control({
	init: function () {

		/** Champ-names on blue side */
		this.options.blue = [];
		/** Champ-names on purple side */
		this.options.purple = [];

		/** @type {{data: ChampionModel, summonerSpells: (SpellModel[]), team: String}} */
		this.options.participantsByChamp = {};

		/**
		 * Panel
		 * @typedef {Object} Panel
		 * @property {Champ} champ
		 * @property {SummonerSpell[]} summonerSpells
		 * @property {String} team
		 * @property {number} index
		 */
		/**
		 * Participant[]
		 * @type {can.List}
		 */
		this.options.panels = new can.List();

		this.element.html(
			can.view('../../../views/match-champions.mustache', this.options.panels)
		);

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

	/** SummonerSpell
	 * @typedef {Object} SummonerSpell
	 *@property {String} name
	 *@property {String} description
	 *@property {Number[]} cooldown
	 *@property {Number[]} range
	 *@property {LeagueDataImage} image */

	/** Team
	 * @propertyOf LeagueData
	 * @typedef {Object} Team
	 * @property {Champ} champ
	 * @property {SummonerSpell[]} summonerSpells*/

	/** Champ
	 * @typedef {Object} Champ
	 * @property {String} name
	 * @property {String[]} allytips
	 * @property {String[]} enemytips
	 * @property  {{ LeagueDataImage }} image
	 * @property {{ name: String, description: String, image: LeagueDataImage }} passive
	 * @property {{ LeagueDataSpell[] }} spells
	 */

	/**
	 * @param {LeagueData} data
	 */
	loadChampions: function (data) {
		var self = this;
		steal.dev.log("Data arrived at ChampionCtrl .loadChampions: ", data);
		steal.dev.log('ChampionCtrl champ data:', data);

		// TODO: cache sprites locally
		data.blue.map(function (el, index) {
			self.options.blue.push(new ChampionModel(el.champ));
			self.loadParticipant(el, 'blue');
		});
		data.purple.map(function (el, index) {
			self.options.purple.push(new ChampionModel(el.champ));
			self.loadParticipant(el, 'purple');
		});
	},
	loadParticipant: function (data, team) {
		var summonerSpells = [];
		summonerSpells.push(new SpellModel(data.summonerSpells[0]));
		summonerSpells.push(new SpellModel(data.summonerSpells[1]));
		this.options.participantsByChamp[data.champ.name] =
		{
			'champ': new ChampionModel(data.champ),
			'summonerSpells': summonerSpells,
			'team': team
		}
	},
	addPanel: function (champName) {
		console.log("addPanel");
		if (this.element.find('[alt="' + champName + '"]').length) {
			return;
		}
		if (this.options.panels.length >= 5) {
			this.options.panels.pop();
		}
		var panel =	 this.options.participantsByChamp[champName];
		panel.index = this.options.panels.length;
		this.options.panels.push(panel);
		steal.dev.log('added Panel: ', this.options.panels);
	},
	addCloseAllBtn: function(){
		var $close = $('#close-all-btn');
		if ($close.length){
			$close.show();
		} else {
			var $closeAllBtn = $('<div id="close-all-btn" class="btn close table-cell">');
			this.element.prepend($closeAllBtn);
		}
	},
	removeCloseAllBtn: function () {
		$('#close-all-btn').hide();
	},
	closeAllPanels: function () {
		this.options.panels.replace(new can.List());
		this.removeCloseAllBtn();
	},
	removePanel: function (champ) {
		var self = this;
		this.options.panels.each(function (item, index) {
			if (champ == item.champ.name) {
				self.options.panels.splice(index, 1);
				return false;
			}
		});
		if (this.options.panels.length <= 1){
			this.removeCloseAllBtn();
		}
	},
	showTeam: function (team) {
		var self = this;
		var teamList = new can.List();
		this.options[team].map(function (champModel) {
			teamList.push(self.options.participantsByChamp[champModel.name]);
		});
		self.options.panels.replace(teamList);
	},

	'show/:team route': function (data) {
		steal.dev.warn(':team route triggered - adding Panels for Team:', data.team);
		this.showTeam(data.team);
		this.addCloseAllBtn();
	},
	'add/:champ route': function (data) {
		steal.dev.warn(':champ route triggered - adding champ', data.champ);
		this.addPanel(data.champ);
		if (this.options.panels.length >= 2){
			this.addCloseAllBtn();
		}
	},
	'.close click': function($el, ev){
		var champ = $el.closest('.panel').attr('data-name');
		console.log($el, champ);

		this.removePanel(champ);
	},
	'#close-all-btn click': function(){
		this.closeAllPanels();
	}
});
module.exports = ChampionCtrl;