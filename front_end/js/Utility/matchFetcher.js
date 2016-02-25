import $ from 'jquery'

var PLUGIN_ID = 'plugin';

// TODO: implement mechanism to not be required to open and close the same file over and over but still having the possibility to use the methods independently
// TODO: cache gamelog constantly and use the cache to read information

var isReady = $.Deferred();
var GAME_LOG_FILE_ID = "currGameLog";
var GAME_LOG_5v5_SPAWNING_DONE_MARK = 'GAMESTATE_GAMELOOP Begin'; // both in replay and live safe way // not working in 3v3?
//var GAME_LOG_ALT_SPAWNING_DONE_MARK = 'Finished spawning heroes/minions'; // NOTE: can appear before all champs spawned!
// 5v5 also: GAMESTATE_GAMELOOP Begin
/** If there is no line with 'replay mode' until the hardware section, its an actual game */
var GAME_LOG_CHECK_FOR_REPLAY_END = '-----HARDWARE INFORMATION START-----';
var GAME_LOG_REPLAY_INDICATOR = 'Replay mode';

var matchFetcher = {
	isReady: isReady.promise(),
	initRan: false,

	STRING_ACTIVE_GAME: 'game',
	STRING_SPECTATE: 'spectate',
	STRING_REPLAY: 'replay',

	init: function () {
		console.log('initialising matchFetcher..........');
		console.log('adding simpleIOplugin to DOM.........');
		$('body').append('<embed id="' + PLUGIN_ID + '" type="application/x-simple-io-plugin" width=0px height=0px/>');
		navigator.plugins.refresh(false);

		setInterval(function () { // TODO: what is this for? Some kind of hack-fix, not sure if neccessary
			var a = document.getElementById('plugin');
			var b = document.querySelector("#plugin");
		}, 1000);

		this.initRan = true;
		setReady();
	},
	throwIfNotReady(){
		navigator.plugins.refresh(false);
		if (this.initRan === false) {throw new Error('matchFetcher is not initialised. run .init() before sending data!')}
	},
	getGameRoot: function () { // cached
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();

		if (matchFetcher.gameRoot){
			def.resolve(matchFetcher.gameRoot);
		} else {
			overwolf.games.getRunningGameInfo(function (gameInfo) {
				if (gameInfo == null || parseInt(gameInfo.id / 10) != 5426) {
					console.log("Not in game.");
					def.reject("Not in game.");
				} else {
					console.log("Plugin loaded.");
					var gamePath = gameInfo.executionPath;
					var gameRoot = gamePath.substring(0, gamePath.indexOf("RADS"));
					matchFetcher.gameRoot = gameRoot;
					def.resolve(gameRoot);
				}
			});
		}
		return def.promise();
	},
	getActiveSummoner: function () {
		matchFetcher.throwIfNotReady();

		var def = $.Deferred();

		var foundSummonerName = false;

		matchFetcher.getGameRoot().then(function (gameRoot) {
			return getAirClientVersion(gameRoot).then(
				function (latestAirClientVersion) {
					getLatestFileInDirectory(gameRoot + "RADS/projects/lol_air_client/releases/" + latestAirClientVersion + "/deploy/preferences/")
						.then(function (filename) {
							if (!filename.endsWith(".properties")) {
								console.log("Couldn't find summoner name from file.");
								def.reject("Couldn't find summoner name from file.");
								return;
							}

							if (filename.startsWith("shared_")) {
								filename = filename.substring("shared_".length);
							}

							filename = filename.substring(0, filename.indexOf("."));

							var mySummoner = filename;
							foundSummonerName = true;

							if (foundSummonerName) {
								console.log("My summoner (lowercase): " + mySummoner);
								def.resolve(mySummoner);
							} else {
								console.log("Couldn't find summoner name from file.");
								def.reject("Couldn't find summoner name from file.");
							}
						})
						.fail(function (errMsg) {
							console.log(errMsg);
							def.reject(errMsg)
						});
				}
			)
		});

		return def.promise();
	},
	getActiveRegion: function () { // needs to be chained after a method to check if in game and get the gameroot
		matchFetcher.throwIfNotReady();

		var def = $.Deferred();
		matchFetcher.getGameRoot().then(function (gameRoot) {
			getLatestFileInDirectory(gameRoot + "Logs/Patcher Logs/", "LoLPatcher.log")
				.then(function (filename) {

					console.log('opened ' + filename);

					var lineStartString = 'common.region: ';
					var region = '';
					var foundRegion = false;
					var fileId = 'patcherLog';
					plugin().listenOnFile(fileId, gameRoot + "Logs/Patcher Logs/" + filename, false, function (id, status, fileData) {
						if (foundRegion) {
							return; // don't read anymore lines when finished with this file
						}

						if (id != fileId || !status) {
							return;
						}

						if (!fileData.includes("common.region")) {
							return;
						}

						region = fileData.substring(lineStartString.length);
						console.log('Found region ' + region);
						foundRegion = true;
						closeFile(fileId);
						def.resolve(region.toLowerCase());
					});
				})
				.fail(function (errMsg) {
					console.log("Couldn't open logfile for Patcher - assuming Garena Client");
					def.resolve('garena');
				});
		});
		return def.promise();
	},
	getMatchInfo: function () {
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		var result = new Result();
		result.status = "error";


		matchFetcher.getGameRoot()
			.then(function (gameRoot) {

				return getAirClientVersion(gameRoot).then(
					function (clientVersion) {
						return addFilenameAndSummonerToData({gameRoot: gameRoot, latestAirClientVersion: clientVersion})
					}
				)
			})
			.then(collectParticipantsData)
			.then(function (matchInfo) {
				result.status = "success";
				result.errorMessage = null;
				result.matchInfo = matchInfo;
				console.log("success: " + matchInfo);
				def.resolve(result);
			})
			.fail(function (errorMsg) {
				result.errorMessage = errorMsg;
				console.log(errorMsg);
				def.reject(errorMsg);
			});
		return def.promise();
	},
	getGameLogFilePath : function () { // cached
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		if (matchFetcher.gameLogFilePath){
			def.resolve(matchFetcher.gameLogFilePath);
		} else {
			var path = 'Logs/Game - R3d Logs/';
			matchFetcher.getGameRoot().then(function (gameRoot) {
				return getLatestFileInDirectory(gameRoot + path).then(function(filename){
					matchFetcher.gameLogFilePath = gameRoot + path + filename;
					def.resolve(matchFetcher.gameLogFilePath);
				});
			}).fail(function () {
				console.warn('getGameLogFilePath failed');
			});
		}
		return def.promise();
	},
	/** User spectates his own game */
	isReplay: function () {
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		matchFetcher.getGameRoot().then(isReplayClient).then(function(isReplayClient){
			if (isReplayClient) {
				isUserReplay().then(function (isUserReplay) {
					def.resolve(isUserReplay);
				});
			} else {
				def.resolve(false);
			}
		}).fail(function (errMsg) {
			console.log('isReplay failed');
			def.reject(errMsg);
		});
		return def.promise();
	},
	/** User spectates someone other */
	isSpectate: function () {
		matchFetcher.throwIfNotReady();
		return matchFetcher.getGameRoot().then(isReplayClient);
	},
	isReplayOrSpectate: function () {
		matchFetcher.throwIfNotReady();
		return matchFetcher.isSpectate();
	}
};


//region Data-Objects

/** @typedef {object} MatchInfoResult
 * @property {string} status
 * @property {string} errorMessage
 * @property {LeagueMatchInfo} matchInfo */
function Result() {
	this.status = "error";
	this.errorMessage = "";
	this.matchInfo = null;
}

/** @typedef {object} Participant
 * @property {string} champion name of the champ
 * @property {string} summoner name of the summoner
 * @property {number} team 100 | 200
 * */
/** @typedef {object} LeagueMatchInfo
 * @property {string} myChampion
 * @property {Array.<Participant>} team_100 Champion names within Team 100
 * @property {Array.<Participant>} team_200 Champion names within Team 200
 * @property {string} alliedTeamKey team_100 or team_200
 * @property {string} enemyTeamKey team_100 or team_200
 */
/**
 * @type LeagueMatchInfo
 * @constructor
 */
function MatchInfo() {
	/**
	 * Contains the name of your own champion
	 * @property
	 * @type {null}
	 */
	this.myChampion = null;
	/** true if the user is a participant within this match */
	this.containsMyself = false;

	this.team_100 = [];
	this.team_200 = [];
	this.alliedTeamKey = 0;
	this.enemyTeamKey = 0;
}

function LineInfo() {
	this.champion = "";
	this.team = 0;
	this.summoner = ""
}
//endregion

function plugin() {
	return document.querySelector('#plugin');
}
function setReady() {
	isReady.resolve(true);
	isReady = null;
}

function closeFile(fileId) {
	console.log("Closing file " + fileId + " in 2000 MS...");
	setTimeout(function () {
		plugin().stopFileListen(fileId);
		console.log("File listener closed.");
	}, 2000);
}

// getMatchInfo(function(res) {
//     console.log(res);
// });

/**
 * @param {Object} data
 * @param {string} data.latestAirClientVersion
 * @param {string} data.gameRoot
 */
function addFilenameAndSummonerToData(data) { // TODO: rename appropriatly
	var def = $.Deferred();

	matchFetcher.getActiveSummoner()
		.then(function (mySummoner) {
			getLatestFileInDirectory(data.gameRoot + "Logs/Game - R3d Logs/")
				.then(function (filename) {
					data.mySummoner = mySummoner;
					data.filename = filename;
					def.resolve(data);
				})
				.fail(function (errMsg) {
						console.log(errMsg);
						def.reject(errMsg);
					}
				);
		});
	return def.promise();
}

function isGameLogSpawningFinished(lineDataString) {
	return lineDataString.includes(GAME_LOG_5v5_SPAWNING_DONE_MARK);
}
/**
 * @param {Object} data
 * @param {string} data.latestAirClientVersion
 * @param {string} data.gameRoot
 * @param {string} data.filename name of the latest log-file
 * @param {string} data.mySummoner Summonername of the active player
 */
function collectParticipantsData(data) {
	var def = $.Deferred();

	var regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/;
	var lines = [];
	var foundMySummoner = false;
	var myTeam;
	var matchInfo = new MatchInfo();
	var fileListenerIsClosing = false;

	plugin().listenOnFile(GAME_LOG_FILE_ID, data.gameRoot + "Logs/Game - R3d Logs/" + data.filename, false, function (id, status, fileData) {
		console.warn(fileData);
		//region condition-checks
		if (fileListenerIsClosing) {
			return; // don't read anymore lines when finished with this file
		}
		if (id != GAME_LOG_FILE_ID || !status) {
			closeFile(id);
			fileListenerIsClosing = true;
			def.reject("Couldn't find match info from file.");
			return;
		}

		var allParticipantsRead = (lines.length == 10 || isGameLogSpawningFinished(fileData));
		if (allParticipantsRead) {
			closeFile(GAME_LOG_FILE_ID);
			fileListenerIsClosing = true;
			console.log('Matchdata is ready');

			if (foundMySummoner) {
				matchInfo.containsMyself = true;
				console.log("User is present in this game (playing or replay)", matchInfo);
			} else {
				matchInfo.containsMyself = false; // spectating someone
				console.log("User is spectating someone else", matchInfo);
			}
			def.resolve(matchInfo);
			return;
		}

		if (!fileData.includes("Spawning champion")) {
			return;
		}
		//endregion

		//region logic
		var matches = regEx.exec(fileData);

		var line = new LineInfo();
		line.champion = matches[1];
		line.team = matches[2];
		line.summoner = matches[4];

		lines.push(line);

		console.log("Found line for summoner: " + line.summoner);

		matchInfo['team_' + line.team].push({
			champion: line.champion,
			summoner: line.summoner,
			team: line.team
		});

		if (line.team != myTeam) {
			matchInfo.enemyTeamKey = 'team_' + line.team;
		} else {
			matchInfo.alliedTeamKey = 'team_' + line.team;
		}

		if (line.summoner.toLowerCase() == data.mySummoner.toLowerCase() || unescape(encodeURIComponent(line.summoner)).toLowerCase() == data.mySummoner.toLowerCase()) {
			myTeam = line.team;
			matchInfo.myChampion = line.champion;
			foundMySummoner = true;
			console.log("Found my summoner in match.");
		}
		//endregion
	});

	return def.promise();
}

/**
 * return Promise - resolves into {{string} gameroot, {string} latestAirClientVersion}
 */
function getAirClientVersion(gameRoot) {
	var def = $.Deferred();

	var latestAirClientVersion = "0";

	plugin().listDirectory(gameRoot + "RADS/projects/lol_air_client/releases/*", function (status, listing) {
		var foundLatestAirClientVersion = false;
		var res = JSON.parse(listing);

		var maxVer = "0";

		res.forEach(function (file) {
			if (file.type == "dir" && file.name > maxVer) {
				maxVer = file.name;
				foundLatestAirClientVersion = true;
			}
		});

		if (foundLatestAirClientVersion) {
			latestAirClientVersion = maxVer;
			console.log("Found latest air client version: " + latestAirClientVersion);
			def.resolve(latestAirClientVersion);
		} else {
			def.reject("Couldn't find latest air client version.")
		}
	});

	return def.promise();
}

/**
 * Checks if the current summoner participates within the match.
 * Assumes that the match is a replayClient match, otherwise the summoner
 * is always within the match unless something went wrong with the logs or
 * processing of it.
 *
 * @param summoner name of the summoner to check for
 * @requires isReplayClient to be true
 */
function isUserReplay() { // TODO: testen
	var def = $.Deferred();

	var fileId = 'checkForSummoner';
	var fileListenerIsClosing = false;
	$.when(matchFetcher.getGameLogFilePath(), matchFetcher.getActiveSummoner()).then(function (gameLogPath, summoner) {
		plugin().listenOnFile(fileId, gameLogPath, false, function (id, status, fileData) {
			if (fileListenerIsClosing) {
				return; // don't read anymore lines when finished with this file
			}
			if (id != fileId || !status) {
				fileListenerIsClosing = true;
				closeFile(id);
				def.reject("Couldn't find match info from file.");
				return;
			}

			if (fileData.toLowerCase().includes(summoner)) {
				fileListenerIsClosing = true;
				closeFile(fileId);
				console.log('Summoner found in Match, it\'s a replay');
				def.resolve(true);
				return;
			}

			if (isGameLogSpawningFinished(fileData)) {
				fileListenerIsClosing = true;
				closeFile(fileId);
				console.log('Summoner not found in Match, it\'s a spectate');
				def.resolve(false);
				return;
			}
		});
	});
	return def.promise();
}

/**
 *
 * @param {string} dir directory-path with trailing slash (e.g. path/to/something/ )
 * @param searchTerm limits possible result to only the filenames containing the searchTerm somewhere in its name
 * @returns {*} Promise that resolves to the name of the last modified file
 */
function getLatestFileInDirectory(dir, searchTerm) { // TODO: add directory to resolve and use it for the path instead of combining it all over the place
	var def = $.Deferred();

	searchTerm = (typeof searchTerm === 'undefined') ? "*" : "*" + searchTerm + "*";
	plugin().getLatestFileInDirectory(dir + searchTerm, function (status, filename) {
		if (!status) {
			def.reject("Unable to open any file.");
			return;
		}
		def.resolve(filename);
	});

	return def.promise();

}
/**
 * Checks if the logged match is a replay or an actual game the user plays atm
 * @param gameRoot
 */
function isReplayClient(gameRoot) { // TODO: testen
	var def = $.Deferred();

	var foundReplayMode = false;
	var fileId = 'checkForReplayClient';
	var fileListenerIsClosing = false;
	getLatestFileInDirectory(gameRoot + "Logs/Game - R3d Logs/")
		.then(function (filename) {
			plugin().listenOnFile(fileId, gameRoot + "Logs/Game - R3d Logs/" + filename, false, function (id, status, fileData) {
				if (fileListenerIsClosing) {
					return; // don't read anymore lines when finished with this file
				}
				if (id != fileId || !status) {
					fileListenerIsClosing = true;
					closeFile(fileId);
					def.reject("Couldn't find match info from file.");
					return;
				}

				if (fileData.includes(GAME_LOG_REPLAY_INDICATOR)) {
					fileListenerIsClosing = true;
					closeFile(fileId);
					foundReplayMode = true;
					console.log('Match is in Replay Mode');
					def.resolve(true);
					return;
				}

				if (fileData.includes(GAME_LOG_CHECK_FOR_REPLAY_END)) {
					fileListenerIsClosing = true;
					closeFile(fileId);
					console.log('Match is an actual game, no replay mode indicator found');
					def.resolve(false);
					return;
				}
			});
		})
		.fail(function () {
			console.log(errMsg);
			def.reject(errMsg);
		});
	return def.promise();
}

export default matchFetcher;