"use strict";
steal(
	'ChampionModel.js'
	, function (/**ChampionModel*/ ChampionModel) {

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

				var params = {summonerId: transfer.summonerId, server: transfer.server};
				if (localStorage.getItem('lock_getCachedGame') == "1"){
					debugger;
					params['gameId'] = localStorage.getItem('temp_gameId');
				}
				steal.dev.log('request for gamedata with params:', params);
				jQuery.get(RIOT_ADAPTER_URL
					, params
					, function (data) { // success
						steal.dev.log("gameData from Server:", data);
						DDRAGON_URL = DDRAGON_BASE_URL + data.version + '/';
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
						localStorage.setItem('temp_gameId', dataArray['gameId']);
						localStorage.setItem('lock_getCachedGame', "1");

						self._extractParticipants(transfer, dataArray, 'blue');
						self._extractParticipants(transfer, dataArray, 'purple');
						transfer.version = dataArray.version;

						steal.dev.log('GameData in loadMatchModel:',transfer );
						deferred.resolve(transfer);
						dataArray = null;
					}).fail(function (data, status, jqXHR) {

						localStorage.setItem('lock_getCachedGame', "0");

						steal.dev.warn("Loading MatchModel failed!", data, status, jqXHR);

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
					var participant = {
						'champ': new ChampionModel(teamArray[i].champ),
						'team': team
					};
					transfer[team][i] = participant;
					transfer.participantsByChamp[participant.champ.name] = participant;
				}
			}

		});
		return MatchDAO;
	});