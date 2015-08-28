"use strict";
var can = require('can');
var SpellModel = require('./SpellModel');
require('../../constants');

var ChampionModel = can.Model({},{
	init: function (options) {

		var self = this;
		var spells = options.spells;
		options.spells = [];
		spells.map(function(el, index){
			options.spells.push(
				new SpellModel(el)
			);
		});
		var passive = options.passive;
		options.passive = new SpellModel(passive);
	},
	//// TODO:
	//findAll: 'GET /champ.json',
	//findOne: 'GET /champ/{id}.json',
	//create:  'POST /champ.json',
	////update:  'PUT /champ/{id}.json',
	//destroy: 'DELETE /champ/{id}.json',
	imgSrc: function(){
		return DDRAGON_IMG_URL + '/champion/' + this.image.full; // TODO: replace with sprites
	},
	tooltip: function () {

	}
});
module.exports = ChampionModel;