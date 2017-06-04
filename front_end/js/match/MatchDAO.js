"use strict";
import can from 'can';
import ChampionModel from 'ChampionModel';
import SettingsModel from 'SettingsModel';
import Settings from 'SettingsProvider';
import analytics from 'analytics';

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
	 * @param {string} transfer.server - of the Summoner to lookup
	 * @returns {Promise | Array} Promise that resolves into an Array with all the Data from Riot for the match
	 * structured like {@link MatchModel}
	 * @private
	 */
	_loadDataFromServer: function (transfer, owIoLolService) { // TODO: move variables into transferItem
		var deferred = $.Deferred();

		var params;

		var server;

		owIoLolService.getActiveRegion().then(function (serv) {// TODO: load this previously and give as dependencies
				server = serv;
			Settings.getInstance().server(server); // TODO: handle this outside of DAO!
			analytics.refreshRegion();
			return owIoLolService.getMatchInfo();// TODO:  load this previously and give as dependencies
			})
			.then(function (/** MatchInfoResult */ matchData) {
				/** LeagueMatchInfo */
				var matchInfo = matchData.matchInfo; // TODO: move variables into transferItem

				var champions = [];
				for (var i = 0; i < matchInfo.team_100.length; i++) {// TODO: move variables into transferItem
					champions.push(matchInfo.team_100[i].champion);// TODO: move variables into transferItem
				}
				for (var i = 0; i < matchInfo.team_200.length; i++) {// TODO: move variables into transferItem
					champions.push(matchInfo.team_200[i].champion);// TODO: move variables into transferItem
				}

				params = {server: server, championKeys: champions.toString()};// TODO: move variables into transferItem
				steal.dev.log('request for champion-data with params:', params, CHAMPION_INFO_URL);
				return jQuery.get(CHAMPION_INFO_URL
					, params
					, function (/** LeagueMatchInfo */ data) { // success
						steal.dev.log("championData from Server:", data);

						data.team_100 = matchInfo.team_100;// TODO: move variables into transferItem
						data.team_200 = matchInfo.team_200;// TODO: move variables into transferItem

						LOL_PATCH = data.version;
						DDRAGON_URL = DDRAGON_BASE_URL + LOL_PATCH + '/';
						deferred.resolve(data); // TODO: comment when done with other request type (2017/06/04: what??)
					});
			})
			.catch(function (data, status, jqXHR) {
				deferred.reject(data, status, jqXHR);
			});

		return deferred.promise();
	},
	/**
	 * Loads the Data for the current match from Server and fills the given {@link MatchModel }
	 * @param {MatchModel} transfer
	 * @param {string} transfer.server - of the Summoner to lookup
	 * @returns {Promise | MatchModel} Promise that resolves into the filled {@link MatchModel} Object
	 */
	loadMatchModel: function (transfer, owIoLolService) { // TODO: move variables into transferItem
		var deferred = $.Deferred();
		var self = this;

		self._loadDataFromServer(transfer, owIoLolService)
			.then(function (dataJson) {
				steal.dev.log(new Date(), 'GameData in loadMatchModel (start):', transfer);

				transfer.team_100 = dataJson.team_100;
				transfer.team_200 = dataJson.team_200;
				self._extractParticipants(transfer, dataJson, 'team_100');
				self._extractParticipants(transfer, dataJson, 'team_200');

				transfer.version = dataJson.version;

				steal.dev.log(new Date(), 'GameData in loadMatchModel (end):', transfer);
				deferred.resolve(transfer);
				dataJson = null;
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
	 * @param dataArray.champsByKey {Array} key->value champKey->champData
	 * @param {string} team team_100 | team_200
	 * @private
	 */
	_extractParticipants: function (transfer, dataArray, team) {
		transfer[team] = [];
		var teamArray = dataArray[team];
		var champsByKey = dataArray.champsByKey;
		for (var i = 0; i < teamArray.length; i++) {
			var participant = {
				'champ': new ChampionModel(champsByKey[teamArray[i].champion]),
				'team': team
			};
			transfer[team][i] = participant;
			transfer.participantsByChamp[participant.champ.name] = participant;
		}
	}

});
export default MatchDAO;
