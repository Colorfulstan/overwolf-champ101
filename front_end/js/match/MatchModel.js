"use strict";
import 'global';

/**
 * Data about the current Match
 * @class
 * @constructor
 * @typedef {object} MatchModel
 */
var MatchModel = function MatchModel(summonerId, server) {

	/** The region-Code of a server
	 * @type {string}*/
	this.server = server; // TODO: model refactoring for computes

	/**
	 * @type {string}
	 * @property
	 * @deprecated */
	this.summonerId = summonerId; // TODO: model refactoring for computes

	/** Team 100
	 * @property
	 * @type {SummonerModel[]}
	 * @deprecated use team_100 instead*/
	this.blue = [];

	/** Team 200
	 * @type {SummonerModel[]}
	 * @deprecated use team_200 instead*/
	this.red = [];

	/** Team blue
	 * @property
	 * @type {Array} */
	this.team_100 = [];
	/** Team red
	 * @property
	 * @type {Array} */
	this.team_200 = [];

	/**
	 * Different representation of blue and red.
	 * @property
	 * @type {object}
	 */
	this.participantsByChamp = {};

	/** The most recent Version of the ddragon cdn ressources
	 * Used within the ddragon URL
	 * @property
	 * @type {string}*/
	this.version = null;

	/** The most recent GameId of the given summoner
	 * @property
	 * @type {number}
	 * @deprecated */
	this.gameId = null;
};

export default MatchModel;