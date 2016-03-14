"use strict";
import 'global';
import can from 'can';
import SpellModel from 'SpellModel';
import ImageModel from 'ImageModel';
/**
 * testblabla
 * @class {ChampionModel}
 */
var ChampionModel = function ChampionModel(options) {

	/** @type  {{ ImageModel }} */
	this.image = (function (_options) {
		return new ImageModel(_options.image); // TODO: attr()
	})(options);

	/** @type {SpellModel} */
	this.passive = (function (_options) {
		_options.passive.champId = _options.id;
		_options.passive.type = 'passive'; // TODO: do in backend?
		return new SpellModel(_options.passive);
	})(options);

	/** @type {Array.<SpellModel>} */
	this.spells = (function (_options) {
		return _options.spells.map(function (spell, index) {
			spell.champId = _options.id;
			spell.type = 'ability';
			spell.number = index + 2; // setting number to +2 since 1 will be the passive
			return new SpellModel(spell);
		});
	})(options);

	/** @type {string} */
	this.name = options.name;
	/** @type {string} */
	this.title = options.title;
	/** @type {Number} */
	this.id = options.id;
	/** @type {Array.<string>} */
	this.allytips = options.allytips;
	/** @type {Array.<string>} */
	this.enemytips = options.enemytips;

	/**
	 * @typedef {object} ChampionGGDmgCompositionData
	 * @property {number} magicDmg
	 * @property {number} physicalDmg
	 * @property {number} trueDmg
	 */
	/**
	 * @typedef {object} ChampionGGItemsetsData
	 * @property {Array.<number>} items ids used by RIOT static data API
	 * @property {number} games
	 * @property {string} role
	 * @property {number} winPercent with the particular items
	 * */
	/**
	 * @typedef {object} ChampionGGSkillOrderData
	 * @property {Array.<string>} order skill key in order of leveling up
	 * @property {number} games
	 * @property {string} role
	 * @property {number} winPercent
	 */
	/**
	 * @typedef {object} ChampionGGStatsGeneral
	 * @property {number} assists
	 * @property {number} banRate
	 * @property {number} deaths
	 * @property {number} experience
	 * @property {number} goldEarned
	 * @property {number} kills
	 * @property {number} largestKillingSpree
	 * @property {number} minionsKilled
	 * @property {number} neutralMinionsKilledEnemyJungle
	 * @property {number} neutralMinionsKilledTeamJungle
	 * @property {number} overallPosition
	 * @property {number} overallPositionChange
	 * @property {number} playPercent
	 * @property {number} totalDamageDealtToChampions
	 * @property {number} totalDamageTaken
	 * @property {number} totalHeal
	 * @property {number} winPercent
	 */
	/**
	 * @typedef {object} ChampionGGMatchupData
	 * @property {number} games
	 * @property {string} role
	 * @property {number} statScore
	 * @property {number} winRate
	 */
	/**
	 * Contains the Data from champion.gg for each role of the champ.
	 * @typedef {object} ChampionGGRoleData
	 * @property {ChampionGGDmgCompositionData} dmgComposition
	 * @property {object.<ChampionGGItemsetsData>} items mostPopular | mostWins | mostPopularStart | mostWinsStart
	 * @property {object.<ChampionGGSkillOrderData>} skillOrder mostPopular | mostWins
	 * @property {ChampionGGStatsGeneral} statsGeneral
	 * @property {object.<ChampionGGMatchupData>} matchup matchup.statsAgainsUser | not defined if no matchups are found
	 */

	/**
	 * Contains the data for each role the champ is used for acchording to champion.gg
	 * Possible keys:
	 * ADC | SUPPORT | JUNGLE | MIDDLE | TOP
	 * @typedef {object.<ChampionGGRoleData>} ChampionGGData
	 */
	this.roles = options.roles;

	/** @get */
	this.imgSrc = function () { // TODO: get...
		//return DDRAGON_URL + '/img/' + this.image.group + "/" + this.image.full;
		return this.image.src;
	};
	/** @get */
	this.spriteSrc = function () { // TODO: get...
		return this.image.spriteSrc;
	};
	/** @get */
	this.videoAvailable = function () { // TODO: maybe don't implement for Champion Spotlight // TODO: get...
		return this.videoSrcMp4() || this.videoSrcOgg() || this.videoSrcWebm();
	};
	/** @get */
	this.videoSrcOgg = function () { // TODO: get...
		return null; // TODO: Youtube video how to find??
	};
	/** @get */
	this.videoSrcMp4 = function () { // TODO: get...
		return null; // TODO: Youtube video how to find??
	};
	/** @get */
	this.videoSrcWebm = function () { // TODO: get...
		return null; // TODO: Youtube video how to find??
	};
};
export default ChampionModel;