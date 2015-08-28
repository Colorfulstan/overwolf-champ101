"use strict";
var can = require('can');
require('../../constants');

var SpellModel = can.Model({},{
	init: function () {
	},
	//// TODO:
	//findAll: 'GET /champ.json',
	//findOne: 'GET /champ/{id}.json',
	//create:  'POST /champ.json',
	////update:  'PUT /champ/{id}.json',
	//destroy: 'DELETE /champ/{id}.json',
	imgSrc: function(){
		return DDRAGON_IMG_URL + this.image.group + "/" + this.image.full; // TODO: replace with sprites
	}
});
module.exports = SpellModel;