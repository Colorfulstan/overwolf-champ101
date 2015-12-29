"use strict";
steal(
	'can'
	, 'SpellModel.js'
	, 'ImageModel.js'
	, 'global.js'
	, function (can
		, /**SpellModel*/ SpellModel
		, /**ImageModel*/ ImageModel) {

		/**
		 * testblabla
		 * @class {ChampionModel}
		 */
		var ChampionModel = function ChampionModel(options) {

			/** @type  {{ ImageModel }} */
			this.image = (function (_options) {
				return new ImageModel(_options.image); // TODO: attr()
			})(options);

			/** @type {SpellModel} */
			this.passive = (function (_options) {
				_options.passive.champId = _options.id;
				_options.passive.type = 'passive'; // TODO: do in backend?
				return new SpellModel(_options.passive);
			})(options);

			/** @type {Array.<SpellModel>} */
			this.spells = (function (_options) {
				return _options.spells.map(function (spell, index) {
					spell.champId = _options.id;
					spell.type = 'ability';
					spell.number = index + 2; // setting number to +2 since 1 will be the passive
					return new SpellModel(spell);
				});
			})(options);

			/** @type {string} */
			this.name = options.name;
			/** @type {string} */
			this.title = options.title;
			/** @type {Number} */
			this.id = options.id;
			/** @type {Array.<string>} */
			this.allytips = options.allytips;
			/** @type {Array.<string>} */
			this.enemytips = options.enemytips;

			/** @get */
			this.imgSrc = function () { // TODO: get...
				//return DDRAGON_URL + '/img/' + this.image.group + "/" + this.image.full;
				return this.image.src;
			};
			/** @get */
			this.spriteSrc = function () { // TODO: get...
				return this.image.spriteSrc;
			};
			/** @get */
			this.videoAvailable = function () { // TODO: maybe don't implement for Champion Spotlight // TODO: get...
				return this.videoSrcMp4() || this.videoSrcOgg() || this.videoSrcWebm();
			};
			/** @get */
			this.videoSrcOgg = function () { // TODO: get...
				return null; // TODO: Youtube video how to find??
			};
			/** @get */
			this.videoSrcMp4 = function () { // TODO: get...
				return null; // TODO: Youtube video how to find??
			};
			/** @get */
			this.videoSrcWebm = function () { // TODO: get...
				return null; // TODO: Youtube video how to find??
			};
		};
		return ChampionModel;
	});