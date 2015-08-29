require('js/global');
var Model = require('can/model/');
/**
 * Data about the current Match
 * @constructor
 */
var MatchModel = Model.extend('MatchModel', {},{
	init : function(){
	},

	/** The region-Code of a server
	 * @property
	 * @type {String}*/
	server : null,

	/** @property
	 * @type {String} */
	summonerId : null,

	/** Team 100
	 * @property
	 * @type {SummonerModel[]} */
	blue : [],

	/** Team 200
	 * @property
	 * @type {SummonerModel[]} */
	purple : [],

	/**
	 * Different representation of blue and purple.
	 * @property
	 * @type {Object}
	 */
	participantsByChamp : {},

	/** The most recent Version of the ddragon cdn ressources
	 * Used within the ddragon URL
	 * @property
	 * @type {String}*/
	version : null,
});
module.exports = MatchModel;

