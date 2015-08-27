"use strict";
var can = require('can');
require('../../constants');
require('./fixtures');
require('./Routing');

var ChampionModel = can.Model({
	init: function () {

	},
	// TODO:
	findAll: 'GET /champ.json',
	findOne: 'GET /champ/{id}.json',
	create:  'POST /champ.json',
	//update:  'PUT /champ/{id}.json',
	destroy: 'DELETE /champ/{id}.json',
	imgSrc: function(){
		return DDRAGON_IMG_URL + '/champion/' + this.image.full; // TODO: replace with sprites
	},
	tooltip: function () {

	}
});
module.exports = ChampionModel;