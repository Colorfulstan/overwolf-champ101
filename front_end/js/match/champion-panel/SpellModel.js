"use strict";
var can = require('can');
var ImageModel = require('ImageModel');
require('global');

/** * // TODO: add more from backend and doc here

 * @see SpellModel.init()
 * */
var SpellModel = can.Model.extend('SpellModel',{}, {
	/**
	 * @param options.name {String}
	 * @param options.type {String}
	 * @param options.description {String}
	 * @param options.image {ImageModel}
	 * @param options.number {Number}
	 * @param options.cooldown TODO
	 * @param options.range TODO
	 */
	init: function (options) {
		var imgData = options.image;
		options.image = new ImageModel(imgData);

		this.attr('enableVideo', false);
		if (options.type != undefined){
			this.attr('type', options.type);
			switch (options.type){
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
	champId : null,
 	/** @property
	 * @type {Number[]} */
	cooldown: null,
	/** @property
	 * @type {Number[]} */
	range: null,
	imgSrc : function(){
		return DDRAGON_IMG_URL + this.image.group + "/" + this.image.full;
	},
	videoAvailable : function(){
		if (this.attr('enableVideo') != null) return this.attr('enableVideo');
		else return this.videoSrcMp4() || this.videoSrcOgg() || this.videoSrcWebm();
	},
	videoId: function(){
		return this.name.replace(' ', '-');
	},
	cdnChampId: function () {
		var id = '';
		var cId = this. champId;
		if (this.champId < 10){
			id = '000' + cId;
		} else if (this.champId < 100){
			id = '00' + cId;
		} else if (this.champId < 1000){
			id = '0' + cId;
		} else {
			id = cId;
		}
		return id;
	},
	cdnNumber: function () {
		try { return this.cdnChampId() + '_0' + this.number;
		} catch (e){ console.log(e)}
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/images/0063_03.jpg
	 * @returns {string}
	 */
	videoPosterSrc : function(){
		return CDN_ABILITIES_URL + 'images/'+ this.cdnNumber() + '.jpg';
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/videos/ogv/0063_03.ogv
	 * @returns {string}
	 */
	videoSrcOgg : function(){
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/ogv/'+ this.cdnNumber() + '.ogv';
	},
	/**
	 * @example  http://cdn.leagueoflegends.com/champion-abilities/videos/mp4/0063_03.mp4
	 * @returns {string}
	 */
	videoSrcMp4 : function(){
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/mp4/'+ this.cdnNumber() + '.mp4';
	},
	/**
	 * @example http://cdn.leagueoflegends.com/champion-abilities/videos/webm/0063_03.webm
	 * @returns {string}
	 */
	videoSrcWebm : function(){
		// TODO: Fallbakc if not available
		return CDN_ABILITIES_URL + 'videos/webm/'+ this.cdnNumber() + '.webm';
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