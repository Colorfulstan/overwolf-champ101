"use strict";
import 'global';
import can from 'can';
import ImageModel from 'ImageModel';
import TooltipCtrl from 'TooltipCtrl';
import analytics from 'analytics';

/**
 * @class {object} SpellModel
 *
 * @property {string} name
 * @property {string} type 'ability' or 'passive'
 * @property {string} description
 * @property {ImageModel} image
 * @property {Number} number The Number of the spell for the champ. <br>1 will be the passive, 2-4 the abilities and 5 will be the ultimate
 * @property {Number} enableVideo If this Spell has a Video or not (SummonerSpells do not
 * @property {Number} champId
 * @property {Array.<Number>} cooldown
 * @property {string} cooldownBurn
 * @property {Array.<Number>} range
 * @property {string} tooltip
 * @property {Array.<Array.<Number>>} effect
 * @property {Array.<string>} effectBurn
 * @property {string} resource
 * @property {Array.<Number>} cost
 * @property {string} costBurn
 * @property {string} costType
 */
var SpellModel = can.Map.extend('SpellModel', {}, {
	/**
	 * @constructor
	 *
	 * @param {string} options.name
	 * @param {string} options.champId
	 * @param {string} options.type
	 * @param {string} options.description
	 * @param {string} options.tooltip

	 * @param {ImageModel} options.image
	 * @param {Number} options.number
	 * @param {string} options.cooldownBurn
	 * @param {string} options.costBurn
	 * @param {string} options.resource - The Ressource used
	 * @param {string} options.rangeBurn Array with range numbers per level ot 'self' if selfcast only

	 * @param {number[]} options.cooldown
	 * @param {Number[]} options.cost
	 * @param {string[][]} options.effect
	 * @param {string[][]} options.effectBurn
	 * @param {string} options.costType - the Cost as {{ var }} with the ressource appended
	 * @param {Array.<Number>| 'self'} options.range Array with range numbers per level ot 'self' if selfcast only
	 *
	 * @param {Array.<Array>} options.vars
	 * @param {Array.<Number>} options.vars.coeff
	 * @param {string} options.vars.dyn
	 * @param {string} options.vars.key
	 * @param {string} options.vars.link
	 * @param {string} options.vars.ranksWith
	 */
	init: function (options) {

		this.attr('image', new ImageModel(options.image));

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

		if (typeof options.tooltip !== 'undefined' && options.tooltip !== null) {
			// TODO: does this have to know TooltipCtrl to get the valued Tooltip?
			var tooltipValued = TooltipCtrl.tooltipValued(options.tooltip, options.effect, options.vars, options.champId, options.name);
			this.attr('tooltip', tooltipValued);
		}
		if (typeof options.resource !== 'undefined' && options.resource !== null) {
			// TODO: does this have to know TooltipCtrl to get the valued ressource string?
			this.attr('resource', TooltipCtrl.resourceValued(options.resource, options.effectBurn, options.costBurn, options.vars, options.champId, options.name));
		} else {
			this.attr('resource', options.costBurn);
		}
	},

	imgSrc: function () {
		return this.image.src;
	},
	spriteSrc: function () {
		return this.image.spriteSrc;
	},
	videoAvailable: function () {
		if (this.enableVideo != null) return this.enableVideo;
		else return this.videoSrc();
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
	cdnAbilityKey: function () {
		// since the cdn url-format changed, we need to translate the number 1 = passive, 2-4 == skills, 5 = ultimate)
		// into the new key that is appended
		try {
			const keys = [null, 'P1', 'Q1','W1','E1','E3','R1'];

			return keys[this.number];
		} catch (e) { steal.dev.log(e)}
	},
	cdnAbilitiyUriComponent: function(){
		return this.cdnChampId() + '/ability_' + this.cdnChampId() + '_' + this.cdnAbilityKey()
	},
	/**
	 * @example http://d28xe8vt774jo5.cloudfront.net/champion-abilities/0240/ability_0240_R1.jpg
	 * @returns {string}
	 */
	videoPosterSrc: function () {
		return CDN_CLIENT_ABILITIES_URL + this.cdnAbilitiyUriComponent() + '.jpg';
	},
	/**
	 * @example http://d28xe8vt774jo5.cloudfront.net/champion-abilities/0240/ability_0240_R1.jpg
	 * @returns {string}
	 */
	videoSrc: function () {
		return CDN_CLIENT_ABILITIES_URL  + this.cdnAbilitiyUriComponent() + '.webm';
	}
});
export default SpellModel;