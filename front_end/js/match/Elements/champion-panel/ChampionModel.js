"use strict";
steal(
	'can'
	, 'SpellModel.js'
	, 'ImageModel.js'
	, 'global.js'
	, function ( can
		, /**SpellModel*/ SpellModel
		, /**ImageModel*/ ImageModel ) {

		/**
		 * testblabla
		 * @class {ChampionModel}
		 */
		var ChampionModel = can.Model.extend({}, {
			init: function (options) {
				var self = this;
				options.passive.champId = this.id;
				options.passive.type = 'passive'; // TODO: do in backend?
				this.attr('passive', new SpellModel(options.passive));
				this.image = new ImageModel(options.image); // TODO: attr()
				options.image = this.image; // TODO: why is this neccessary?

				var spells = options.spells.map(function (spell, index) {
					spell.champId = self.id;
					spell.type = 'ability';
					spell.number = index + 2; // setting number to +2 since 1 will be the passive
					return new SpellModel(spell);
				});
				this.attr('spells', spells);
			},

			///**@property
			// * @type {String} */
			//name: null,
			//
			///**@property
			// * @type {Number} */
			//id: null,
			///**@property
			// * @type {String[]} */
			//allytips: null,
			//
			///**@property
			// * @type {String[]} */
			//enemytips: null,
			//
			///**@property
			// * @type  {{ ImageModel }} */
			//image: null,
			//
			///**@property
			// * @type {SpellModel} */
			//passive: null,
			//
			///**@property
			// * @type {{ SpellModel[] }} */
			//spells: null,

			imgSrc: function () {
				//return DDRAGON_URL + '/img/' + this.image.group + "/" + this.image.full;
				return this.image.src ;
			},
			spriteSrc: function () {
				return this.image.spriteSrc;
			},
			videoAvailable : function(){ // TODO: maybe don't implement for Champion Spotlight
				return this.videoSrcMp4() || this.videoSrcOgg() || this.videoSrcWebm();
			},
			videoSrcOgg : function(){
				return null; // TODO: Youtube video how to find??
			},
			videoSrcMp4 : function(){
				return null; // TODO: Youtube video how to find??
			},
			videoSrcWebm : function(){
				return null; // TODO: Youtube video how to find??
			}

			//// TODO:
			//findAll: 'GET /champ.json',
			//findOne: 'GET /champ/{id}.json',
			//create:  'POST /champ.json',
			////update:  'PUT /champ/{id}.json',
			//destroy: 'DELETE /champ/{id}.json',
		});
		return ChampionModel;
	});