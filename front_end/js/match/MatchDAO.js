"use strict";
import can from 'can';
import ChampionModel from 'ChampionModel';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import analytics from 'analytics';
import matchFetcher from 'matchFetcher';

import 'global';

/**
 * @class
 * @constructor {@link MatchDAO.init}
 */
var MatchDAO = can.Construct.extend('MatchDAO', {}, {
	/** @constructs */
	init: function () {
	},
	/**
	 * Loads the Data from RIOT_ADAPTER_URL
	 * @param {MatchModel} transfer
	 * @param {number} transfer.summonerId - for the Summoner to lookup
	 * @param {string} transfer.server - of the Summoner to lookup
	 * @returns {Promise | Array} Promise that resolves into an Array with all the Data from Riot for the match
	 * structured like {@link MatchModel}
	 * @private
	 */
	_loadDataFromServer: function (transfer) {
		var deferred = $.Deferred();

		var params;

		// TODO: start here with new matchloading
		matchFetcher.init();

		var championParam, serverParam;
		$.when(matchFetcher.getActiveRegion(), matchFetcher.getMatchInfo())
			.then(function (/** string */ server, /** MatchInfoResult */ matchData) {

				/** LeagueMatchInfo */
				var matchInfo = matchData.matchInfo;

				var champions = [];
				for (var i = 0; i < matchInfo.team_100.length; i++) {
					champions.push(matchInfo.team_100[i].champion);
				}
				for (var i = 0; i < matchInfo.team_200.length; i++) {
					champions.push(matchInfo.team_200[i].champion);
				}

				params = {server: server, championNames: champions.toString()};
				steal.dev.log('request for champion-data with params:', params);
				return jQuery.get(RIOT_ADAPTER_CHAMPION_URL // TODO: refactor to .ajax()
					, params
					, function (/** LeagueMatchInfo */ data) { // success
						steal.dev.log("championData from Server:", data);

						data.team_100 = matchInfo.team_100;
						data.team_200 = matchInfo.team_200;

						LOL_PATCH = data.version;
						DDRAGON_URL = DDRAGON_BASE_URL + LOL_PATCH + '/';
						deferred.resolve(data); // TODO: comment when done with other request type
					});
			})
			//.then(function () {
			//	/** @deprecated */
			//	params = {summonerId: transfer.summonerId, server: transfer.server};
			//
			//	steal.dev.log('request for champion-data with params:', params);
			//	return jQuery.get(RIOT_ADAPTER_URL // TODO: refactor to .ajax()
			//		, params
			//		, function (data) { // success
			//			steal.dev.log("gameData from Server:", data);
			//			//LOL_PATCH = data.version;
			//			//DDRAGON_URL = DDRAGON_BASE_URL + LOL_PATCH + '/';
			//			deferred.resolve(data);
			//		})
			//})

			//var settings = Settings.getInstance();
			//if (settings.cachedGameAvailable()){ // if gameId is given, the game with that id will be load from DB instead of Riot-API
			//	params['gameId'] = settings.cachedGameId();
			//}
			.fail(function (data, status, jqXHR) {
				deferred.reject(data, status, jqXHR);
			});

		return deferred.promise();
	},
	/**
	 * Loads the Data for the current match from Server and fills the given {@link MatchModel }
	 * @param {MatchModel} transfer
	 * @param {number} transfer.summonerId - for the Summoner to lookup
	 * @param {string} transfer.server - of the Summoner to lookup
	 * @returns {Promise | MatchModel} Promise that resolves into the filled {@link MatchModel} Object
	 */
	loadMatchModel: function (transfer) {
		var deferred = $.Deferred();
		var self = this;

		$.when(self._loadDataFromServer(transfer))
			.then(function (dataArray) {
				steal.dev.log(new Date(), 'GameData in loadMatchModel:', transfer);

				transfer.team_100 = dataArray.team_100;
				transfer.team_200 = dataArray.team_200;
				self._extractParticipants(transfer, dataArray, 'team_100');
				self._extractParticipants(transfer, dataArray, 'team_200');

				transfer.version = dataArray.version;

				steal.dev.log(new Date(), 'GameData in loadMatchModel:', transfer);
				deferred.resolve(transfer);
				dataArray = null;
			}).fail(function (data, status, jqXHR) {

			//settings.cachedGameAvailable(false);
			steal.dev.warn(new Date(), "Loading MatchModel failed!", data, status, jqXHR);

			deferred.reject(data, status, jqXHR);
		});
		return deferred.promise();
	},

	/**
	 * Extracts Participants from the dataArray into transfer[team] and into transfer.participantsByChamp
	 * @param transfer {MatchModel} to be filled
	 * @param dataArray {Array}
	 * @param dataArray.team_100 {Array}
	 * @param dataArray.team_200 {Array}
	 * @param dataArray.champsByName {Array} key->value champName->champData
	 * @param {string} team team_100 | team_200
	 * @private
	 */
	_extractParticipants: function (transfer, dataArray, team) {
		transfer[team] = [];
		var teamArray = dataArray[team];
		var champsByName = dataArray.champsByName;
		for (var i = 0; i < teamArray.length; i++) {
			var participant = {
				'champ': new ChampionModel(champsByName[teamArray[i].champion]),
				'team': team
			};
			transfer[team][i] = participant;
			transfer.participantsByChamp[participant.champ.name] = participant;
		}
	}

});
export default MatchDAO;
