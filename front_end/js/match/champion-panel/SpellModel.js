"use strict";
var Model = require('can/model/');
var ImageModel = require('../ImageModel');
require('../../global');

/** * // TODO: add more from backend and doc here

 * @see SpellModel.init()
 * */
var SpellModel = Model.extend('SpellModel',{}, {
	/**
	 * @param options.name {String}
	 * @param options.type {String}
	 * @param options.description {String}
	 * @param options.image {ImageModel}
	 * @param options.cooldown TODO
	 * @param options.range TODO
	 */
	init: function (options) {
		var imgData = options.image;
		options.image = new ImageModel(imgData);
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
	/** @property
	 * @type {Number[]} */
	cooldown: null,
	/** @property
	 * @type {Number[]} */
	range: null,
	imgSrc : function(){
		return DDRAGON_IMG_URL + this.image.group + "/" + this.image.full;
	}

	//// TODO:
	//findAll: 'GET /champ.json',
	//findOne: 'GET /champ/{id}.json',
	//create:  'POST /champ.json',
	////update:  'PUT /champ/{id}.json',
	//destroy: 'DELETE /champ/{id}.json',
});
module.exports = SpellModel;