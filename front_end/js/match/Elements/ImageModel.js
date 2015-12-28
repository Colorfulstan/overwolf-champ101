"use strict";
steal(
	'global.js'
	, function () {

		/** @class ImageModel */
		var ImageModel = function ImageModel(options) {

			this.src = DDRAGON_URL + 'img/' + options.group + "/" + options.full;
			this.spriteSrc = DDRAGON_URL + 'img/sprite/' + options.sprite;

			/** Filename for the single Image
			 * @property
			 * @type {String} */
			this.full = options.full;
			/** Image-group of this image for the URL after /img/
			 * @property
			 * @type {String} */
			this.group = options.group;

			/**@property
			 * @type {String} */
			this.sprite = options.sprite;

			/**@property
			 * @type {Number} */
			this.h = options.h;
			/**@property
			 * @type {Number} */
			this.w = options.w;
			/**@property
			 * @type {Number} */
			this.x = options.x;
			/**@property
			 * @type {Number} */
			this.y = options.y;
		};

		return ImageModel;
	});