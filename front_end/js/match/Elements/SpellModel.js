"use strict";
steal(
	'can'
	, 'ImageModel.js'
	, 'TooltipCtrl.js'
	, 'global.js'
	, function (can
		, /**ImageModel*/ ImageModel
		, /**TooltipCtrl*/ TooltipCtrl) {

		/** * // TODO: add more from backend and doc here
		 * @typedef {Object} SpellModel
		 *
		 * @property {String} name
		 * @property {String} type 'ability' or 'passive'
		 * @property {String} description
		 * @property {ImageModel} image
		 * @property {Number} number The Number of the spell for the champ. <br>1 will be the passive, 2-4 the abilities and 5 will be the ultimate
		 * @property {Number} enableVideo If this Spell has a Video or not (SummonerSpells do not
		 * @property {Number} champId
		 * @property {Array.<Number>} cooldown
		 * @property {String} cooldownBurn
		 * @property {Array.<Number>} range
		 * @property {String} tooltip
		 * @property {Array.<Array.<Number>>} effect
		 * @property {Array.<String>} effectBurn
		 * @property {String} resource
		 * @property {Array.<Number>} cost
		 * @property {String} costBurn
		 * @property {String} costType
		 */
		var SpellModel = can.Map.extend('SpellModel', {}, {
			/**
			 * @constructor
			 *
			 * @param {String} options.name
			 * @param {String} options.type
			 * @param {String} options.description
			 * @param {String} options.tooltip

			 * @param {ImageModel} options.image
			 * @param {Number} options.number
			 * @param {String} options.cooldownBurn
			 * @param {String} options.costBurn
			 * @param {String} options.resource - The Ressource used
			 * @param {String} options.rangeBurn Array with range numbers per level ot 'self' if selfcast only

			 * @param {number[]} options.cooldown
			 * @param {Number[]} options.cost
			 * @param {String[][]} options.effect
			 * @param {String[][]} options.effectBurn
			 * @param {String} options.costType - the Cost as {{ var }} with the ressource appended
			 * @param {Array.<Number>| 'self'} options.range Array with range numbers per level ot 'self' if selfcast only
			 *
			 * @param {Array.<Array>} options.vars
			 * @param {Array.<Number>} options.vars.coeff
			 * @param {String} options.vars.dyn
			 * @param {String} options.vars.key
			 * @param {String} options.vars.link
			 * @param {String} options.vars.ranksWith
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
					this.attr('tooltip', TooltipCtrl.tooltipValued(options.tooltip, options.effect, options.vars));
				}
				if (typeof options.resource !== 'undefined' && options.resource !== null) {
					// TODO: does this have to know TooltipCtrl to get the valued ressource String?
					this.attr('resource', TooltipCtrl.ressourceValued(options.resource, options.effectBurn, options.costBurn, options.vars));
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
		});
		return SpellModel;
	});