"use strict";
var can = require('can');
require('../../constants');

var ChampionModel = can.Model({
	init: function () {

	},
	imgSrc: function(){
		return DDRAGON_IMG_URL + '/champion/' + this.image.full; // TODO: replace with sprites
	}
});
module.exports = ChampionModel;