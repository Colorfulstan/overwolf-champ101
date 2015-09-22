"use strict";
var can = require('can');
var ImageModel = require('ImageModel');
var TooltipCtrl = require('TooltipCtrl');
require('global');

/** * // TODO: add more from backend and doc here

 * @see SpellModel.init()
 * */
var SpellModel = can.Model.extend('SpellModel', {
}, {
	/**
	 * @param options.name {String}
	 * @param options.type {String}
	 * @param options.description {String}
	 * @param options.tooltip {String}

	 * @param options.image {ImageModel}
	 * @param options.number {Number}
	 * @param options.cooldownBurn    {String}
	 * @param options.costBurn {String}
	 * @param options.resource {String} - The Ressource used
	 * @param options.rangeBurn {String} Array with range numbers per level ot 'self' if selfcast only

	 * @param options.cooldown    {number[]}
	 * @param options.cost {Number[]}
	 * @param options.effect {String[][]}
	 * @param options.effectBurn {String[][]}
	 * @param options.costType {String} - THe Cost as {{ var }} with the ressource appended
	 * @param options.range {Number[] | 'self'} Array with range numbers per level ot 'self' if selfcast only
	 *
	 * @param options.vars {Array[]}
	 * @param options.vars.coeff {number[]}
	 * @param options.vars.dyn {String}
	 * @param options.vars.key {String}
	 * @param options.vars.link {String}
	 * @param options.vars.ranksWith {String}
	 *
	 */
	init: function (options) {
		//var imgData = options.image;
		this.image = new ImageModel(options.image);
		options.image = this.image;

		this.attr('enableVideo', false);
		if (options.type != undefined) {
			this.attr('type', options.type);
			switch (options.type) {
				case 'passive':
					this.attr('number', 1);
					this.attr('enableVideo', true);
					break;
				case 'ability':
					this.attr('enableVideo', true);
					break;
				default :
					this.attr('enableVideo', false);
					break;
			}
		}

		if (options.tooltip != null && options.tooltip != undefined) {
			// TODO: does this have to know TooltipCtrl to get the valued Tooltip?
			this.attr('tooltip', TooltipCtrl.tooltipValued(options.tooltip, options.effect, options.vars));
		}
	},

	///**@property
	// * @type {String} */
	//name: null,
	///**@property
	// * @type {String} */
	//type: null,
	///**@property
	// * @type {String} */
	//description: null,
	///**@property
	// * @type {ImageModel} */
	//image: null,
	///** The Number of the spell for the champ.
	// *  1 will be the passive, 2-4 the abilities and 5 will be the ultimate
	// * @property
	// * @type {Number} */
	//number: null,
	///** If this Spell has a Video or not (SummonerSpells do not
	// * @property
	// * @type {Number} */
	//enableVideo: null,
	///**@property
	// * @type {Number} */
	//champId: null,
	//
	///** @property
	// * @type {Number[]} */
	//cooldown: null,
	//
	///** @property
	// * @type {String} */
	//cooldownBurn: null,
	///** @property
	// * @type {Number[]} */
	//range: null,
	//
	///** @property
	// * @type {Number[]} */
	//tooltip: null,
	///** @property
	// * @type {Number[]} */
	//effect: null,
	///** @property
	// * @type {Number[]} */
	//effectBurn: null,
	///** @property
	// * @type {Number[]} */
	//resource: null,
	///** @property
	// * @type {Number[]} */
	//cost: null,
	///** @property
	// * @type {Number[]} */
	//costBurn: null,
	///** @property
	// * @type {Number[]} */
	//costType: null,

	imgSrc: function () {
		return this.image.src;
	},
	spriteSrc: function () {
		return this.image.spriteSrc;
	},
	videoAvailable: function () {
		if (this.attr('enableVideo') != null) return this.attr('enableVideo');
		else return this.videoSrcMp4() || this.videoSrcOgg() || this.videoSrcWebm();
	},
	videoId: function () {
		return this.name.replace(' ', '-');
	},
	cdnChampId: function () {
		var id = '';
		var cId = this.champId;
		if (this.champId < 10) {
			id = '000' + cId;
		} else if (this.champId < 100) {
			id = '00' + cId;
		} else if (this.champId < 1000) {
			id = '0' + cId;
		} else {
			id = cId;
		}
		return id;
	},
	cdnNumber: function () {
		try {
			return this.cdnChampId() + '_0' + this.number;
		} catch (e) { steal.dev.log(e)}
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/images/0063_03.jpg
	 * @returns {string}
	 */
	videoPosterSrc: function () {
		return CDN_ABILITIES_URL + 'images/' + this.cdnNumber() + '.jpg';
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/videos/ogv/0063_03.ogv
	 * @returns {string}
	 */
	videoSrcOgg: function () {
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/ogv/' + this.cdnNumber() + '.ogv';
	},
	/**
	 * @example  http://cdn.leagueoflegends.com/champion-abilities/videos/mp4/0063_03.mp4
	 * @returns {string}
	 */
	videoSrcMp4: function () {
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/mp4/' + this.cdnNumber() + '.mp4';
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/videos/webm/0063_03.webm
	 * @returns {string}
	 */
	videoSrcWebm: function () {
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/webm/' + this.cdnNumber() + '.webm';
		//return null;
	}

	//// TODO:
	//findAll: 'GET /champ.json',
	//findOne: 'GET /champ/{id}.json',
	//create:  'POST /champ.json',
	////update:  'PUT /champ/{id}.json',
	//destroy: 'DELETE /champ/{id}.json',
});
module.exports = SpellModel;