"use strict";
var SpellModel = require('SpellModel');
var ChampionModel = require('ChampionModel');
require('global');
var MatchDAO = can.Construct.extend('MatchDAO', {}, {
	init: function () {
	},
	/**
	 * Loads the Data from RIOT_ADAPTER_URL
	 * @param {MatchModel} transfer
	 * @param {number} transfer.summonerId - for the Summoner to lookup
	 * @param {String} transfer.server - of the Summoner to lookup
	 * @returns {Promise | Array} Promise that resolves into an Array with all the Data from Riot for the match
	 * structured like {@link MatchModel}
	 * @private
	 */
	_loadDataFromServer: function (transfer) {
		var deferred = $.Deferred();
		jQuery.get(RIOT_ADAPTER_URL
			, {summonerId: transfer.summonerId, server: transfer.server}
			, function (data) { // success
				steal.dev.log("gameData from Server:", data);
				window.DDRAGON_URL = DDRAGON_BASE_URL + transfer.version + '/';
				deferred.resolve(data);

			}).fail(function (data, status, jqXHR) {
				deferred.reject([data, status, jqXHR]);
			});
		return deferred.promise();
	},
	/**
	 * Loads the Data for the current match from Server and fills the given {@link MatchModel }
	 * @param {MatchModel} transfer
	 * @param {number} transfer.summonerId - for the Summoner to lookup
	 * @param {String} transfer.server - of the Summoner to lookup
	 * @returns {Promise | MatchModel} Promise that resolves into the filled {@link MatchModel} Object
	 */
	loadMatchModel: function (transfer) {
		var deferred = $.Deferred();
		var self = this;


		$.when(self._loadDataFromServer(transfer))
			.then(function (dataArray) {
				self._extractParticipants(transfer, dataArray, 'blue');
				self._extractParticipants(transfer, dataArray, 'purple');
				transfer.version = dataArray.version;

				steal.dev.log('GameData in %d:',transfer );
				deferred.resolve(transfer);
			}).fail(function (data, status, jqXHR) {

				steal.dev.warn("Loading the Match failed!", data, status, jqXHR);

				deferred.reject(data, status, jqXHR);
			});
		return deferred.promise();
	},

	/**
	 * Extracts Participants from the dataArray into transfer[team] and into transfer.participantsByChamp
	 * @param transfer {MatchModel} to be filled
	 * @param dataArray {Array}
	 * @param dataArray.summonerSpells {Array}
	 * @param dataArray.champ {Array}
	 * @param team
	 * @private
	 */
	_extractParticipants: function (transfer, dataArray, team) {
		transfer[team] = [];
		var teamArray = dataArray[team];
		for (var i = 0; i < teamArray.length; i++) {
			var summonerSpells = [];
			summonerSpells.push(new SpellModel(teamArray[i].summonerSpells[0]));
			summonerSpells.push(new SpellModel(teamArray[i].summonerSpells[1]));

			var participant = {
				'champ': new ChampionModel(teamArray[i].champ),
				'summonerSpells': summonerSpells,
				'team': team
			};
			transfer[team][i] = participant;
			transfer.participantsByChamp[participant.champ.name] = participant;
		}
	}

});
module.exports = MatchDAO;