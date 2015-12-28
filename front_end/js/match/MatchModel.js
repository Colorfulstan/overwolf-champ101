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
		var MatchModel = function MatchModel(summonerId, server) { // TODO: refactor to not being a can.Model but a Map??

			/** The region-Code of a server
			 * @type {String}*/
			this.server = server; // TODO: model refactoring for computes

			/**
			 * @type {String} */
			this.summonerId = summonerId; // TODO: model refactoring for computes

			/** Team 100
			 * @type {SummonerModel[]} */
			this.blue = [];

			/** Team 200
			 * @type {SummonerModel[]} */
			this.purple = [];

			/**
			 * Different representation of blue and purple.
			 * @type {Object}
			 */
			this.participantsByChamp = {};

			/** The most recent Version of the ddragon cdn ressources
			 * Used within the ddragon URL
			 * @type {String}*/
			this.version = null;

			/** The most recent GameId of the given summoner
			 * @type {number}*/
			this.gameId = null;
		};

		return MatchModel;
	});