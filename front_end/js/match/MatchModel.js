"use strict";
steal(
	'can'
	, 'global.js'
	, function (/**can*/ can) {

		/**
		 * Data about the current Match
		 * @class
		 * @constructor
		 */
		var MatchModel = can.Model.extend('MatchModel', {}, { // TODO: refactor to not being a can.Model but a Map??
			init: function (summonerId, server) {
				this.attr('summonerId', summonerId); // TODO: model refactoring for computes
				this.attr('server', server); // TODO: model refactoring for computes
			},

			/** The region-Code of a server
			 * @property
			 * @type {String}*/
			server: null,

			/** @property
			 * @type {String} */
			summonerId: null,

			/** Team 100
			 * @property
			 * @type {SummonerModel[]} */
			blue: [],

			/** Team 200
			 * @property
			 * @type {SummonerModel[]} */
			purple: [],

			/**
			 * Different representation of blue and purple.
			 * @property
			 * @type {Object}
			 */
			participantsByChamp: {},

			/** The most recent Version of the ddragon cdn ressources
			 * Used within the ddragon URL
			 * @property
			 * @type {String}*/
			version: null,

			/** The most recent GameId of the given summoner
			 * @property
			 * @type {number}*/
			gameId: null
		});

		return MatchModel;
	});