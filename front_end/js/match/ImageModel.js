"use strict";
require('../global');
var ImageModel = can.Model.extend('ImageModel', {}, {
	init: function (options) {
	},
	/** Filename for the single Image
	 * @property
	 * @type {String} */
	full: null,
	/** Image-group of this image for the URL after /img/
	 * @property
	 * @type {String} */
	group: null,

	/**@property
	 * @type {String} */
	sprite: null,

	/**@property
	 * @type {Number} */
	h: null,
	/**@property
	 * @type {Number} */
	w: null,
	/**@property
	 * @type {Number} */
	x: null,
	/**@property
	 * @type {Number} */
	y: null,
	imgSrc : function(){
		return DDRAGON_IMG_URL + this.group + "/" + this.full;
	}

	 // TODO: replace with sprites
});
module.exports = ImageModel;