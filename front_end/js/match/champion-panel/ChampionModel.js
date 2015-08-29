"use strict";
var Model = require('can/model/');
var SpellModel = require('./SpellModel');
require('../../global');

var ChampionModel = Model.extend({}, {
	init: function (options) {
		var spells = [];
		options.spells.map(function (el, index) {
			spells.push(new SpellModel(el));
		});
		this.attr('spells', spells);
		this.attr('passive', new SpellModel(options.passive));
	},

	/**@property
	 * @type {String} */
	name: null,

	/**@property
	 * @type {Number} */
	id: null,
	/**@property
	 * @type {String[]} */
	allytips: null,

	/**@property
	 * @type {String[]} */
	enemytips: null,

	/**@property
	 * @type  {{ ImageModel }} */
	image: null,

	/**@property
	 * @type {SpellModel} */
	passive: null,

	/**@property
	 * @type {{ SpellModel[] }} */
	spells: null,

	imgSrc: function () {
		return DDRAGON_IMG_URL + this.image.group + "/" + this.image.full;
	}

	//// TODO:
	//findAll: 'GET /champ.json',
	//findOne: 'GET /champ/{id}.json',
	//create:  'POST /champ.json',
	////update:  'PUT /champ/{id}.json',
	//destroy: 'DELETE /champ/{id}.json',
});
module.exports = ChampionModel;