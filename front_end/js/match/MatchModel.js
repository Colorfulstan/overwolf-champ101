"use strict";
import 'global';

/**
 * Data about the current Match
 * @class
 * @constructor
 */
var MatchModel = function MatchModel(summonerId, server) {

	/** The region-Code of a server
	 * @type {string}*/
	this.server = server; // TODO: model refactoring for computes

	/**
	 * @type {string} */
	this.summonerId = summonerId; // TODO: model refactoring for computes

	/** Team 100
	 * @type {SummonerModel[]} */
	this.blue = [];

	/** Team 200
	 * @type {SummonerModel[]} */
	this.red = [];

	/**
	 * Different representation of blue and red.
	 * @type {object}
	 */
	this.participantsByChamp = {};

	/** The most recent Version of the ddragon cdn ressources
	 * Used within the ddragon URL
	 * @type {string}*/
	this.version = null;

	/** The most recent GameId of the given summoner
	 * @type {number}*/
	this.gameId = null;
};

export default MatchModel;