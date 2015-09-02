"use strict";
var can = require('can');
var ImageModel = require('ImageModel');
require('global');

/** * // TODO: add more from backend and doc here

 * @see SpellModel.init()
 * */
var SpellModel = can.Model.extend('SpellModel', {
	tooltipValued: function (string, effectBurn, vars) {
		var ttNew = string;
		var pattern;

		debugger;

		// vars
		// {{ aX }} are always within the vars Array.
		// sometimes {{ fX }} are found there too, sometimes {{ fX }} refers to the effects / effectsBurn Array
		// so we first check the certain keys within vars and replace them.
		// After that, we replace the {{ eX }} variables since those are unambiguosly within the effects / effectsBurn Array.
		// If after that still {{ fX }} remain, they will be replaced through the effects / effectsBurn Array.
		if (vars !== null && vars != undefined) {
			for (var j = 0; j < vars.length; j++) {
				var type = "";

				switch (vars[j].link){
					//case 'attackdamage':  type = 'AD'
					//	break;
					//case 'bonusattackdamage': type = 'AP';
					//	break;
					//case 'spelldamage':
					//	break;
					//case 'bonusspelldamage':
					//	break;
					default:
						type = vars[j].link; // TODO: link something here (@special.xyz ochurs sometimes)
						break;
				}
// TODO: remove spans or give them classes
				pattern = new RegExp('{{ ' +  vars[j].key  + ' }}', 'g');
				ttNew = ttNew.replace(pattern, '<span style="color:red">' + vars[j].coeff + '* ' + type  + '</span>');
			}
		}

		// effects
		if (effectBurn != null && effectBurn != undefined) {

			for (var i = 1; i <= effectBurn.length; i++) {
				// {{ eX }} always referring to the effect / effectBurn Array
				pattern = new RegExp('{{ e' + i + ' }}', 'g');
				ttNew = ttNew.replace(pattern, '<span style="color:red">'+ effectBurn[i] + '</span>');

				// {{ fX }} was not found within the vars array, the achording index within effects / effectsburn will be used
				// sometimes instead of {{ eX }} used eg Sona
				pattern = new RegExp('{{ f' + i + ' }}', 'g');
				ttNew = ttNew.replace(pattern, '<span style="color:red">' + effectBurn[i]  + '</span>');
			}
		}

		return ttNew;
	}
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
		var imgData = options.image;
		options.image = new ImageModel(imgData);

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
			this.attr('tooltip', SpellModel.tooltipValued(options.tooltip, options.effectBurn, options.vars));
		}
	},

	/**@property
	 * @type {String} */
	name: null,
	/**@property
	 * @type {String} */
	type: null,
	/**@property
	 * @type {String} */
	description: null,
	/**@property
	 * @type {ImageModel} */
	image: null,
	/** The Number of the spell for the champ.
	 *  1 will be the passive, 2-4 the abilities and 5 will be the ultimate
	 * @property
	 * @type {Number} */
	number: null,
	/** If this Spell has a Video or not (SummonerSpells do not
	 * @property
	 * @type {Number} */
	enableVideo: null,
	/**@property
	 * @type {Number} */
	champId: null,

	/** @property
	 * @type {Number[]} */
	cooldown: null,

	/** @property
	 * @type {String} */
	cooldownBurn: null,
	/** @property
	 * @type {Number[]} */
	range: null,

	/** @property
	 * @type {Number[]} */
	tooltip: null,
	/** @property
	 * @type {Number[]} */
	effect: null,
	/** @property
	 * @type {Number[]} */
	effectBurn: null,
	/** @property
	 * @type {Number[]} */
	resource: null,
	/** @property
	 * @type {Number[]} */
	cost: null,
	/** @property
	 * @type {Number[]} */
	costBurn: null,
	/** @property
	 * @type {Number[]} */
	costType: null,

	imgSrc: function () {
		return DDRAGON_IMG_URL + this.image.group + "/" + this.image.full;
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
		} catch (e) { console.log(e)}
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