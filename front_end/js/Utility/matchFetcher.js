import $ from 'jquery'

var PLUGIN_ID = 'plugin';
var DEBUG = true;

// TODO: rename module to something more fitting

// TODO: implement mechanism to not be required to open and close the same file over and over but still having the possibility to use the methods independently
// TODO: cache gamelog constantly and use the cache to read information

var isReady = $.Deferred();
var GAME_LOG_FILE_ID = "currGameLog";
var GAME_LOG_5v5_SPAWNING_DONE_MARK = 'GAMESTATE_GAMELOOP Begin'; // both in replay and live safe way // works in 3v3 custom game - TODO: test in live games 3v3?
//var GAME_LOG_ALT_SPAWNING_DONE_MARK = 'Finished spawning heroes/minions'; // NOTE: can appear before all champs spawned!
/** If there is no line with 'replay mode' until the hardware section, its played game */
var GAME_LOG_CHECK_FOR_REPLAY_END = '-----HARDWARE INFORMATION START-----';
var GAME_LOG_REPLAY_INDICATOR = 'Replay mode';

var matchFetcher = {
	isReady: isReady.promise(),
	initRan: false,

	/**
	 * Contains sideeffects!
	 * @see {@link setReady}
	 * @returns {Promise} resolves to true when matchFetcher is ready
	 */
	init: function () {
		debugLog('initialising matchFetcher..........');

		debugLog('adding simpleIOplugin to DOM.........');
		$('body').append('<embed id="' + PLUGIN_ID + '" type="application/x-simple-io-plugin" width=0px height=0px/>');
		navigator.plugins.refresh(false);
		setInterval(function () { // TODO: what is this for? Some kind of hack-fix, not sure if neccessary
			var a = document.getElementById('plugin');
			var b = document.querySelector("#plugin");
		}, 1000);

		this.initRan = true;
		setReady();
		return this.isReady;
	},
	throwIfNotReady(){
		navigator.plugins.refresh(false);
		if (this.initRan === false) {throw new Error('matchFetcher is not initialised. run .init() before sending data!')}
	},
	getGameRoot: function () { // cached
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();

		if (matchFetcher.gameRoot) {
			def.resolve(matchFetcher.gameRoot);
		} else {
			overwolf.games.getRunningGameInfo(function (gameInfo) {
				if (gameInfo == null || parseInt(gameInfo.id / 10) != 5426) {
					debugLog("matchFetcher().getGameRoot(): Not in game.");
					def.reject("Unable to get GameRoot - Not in game.");
				} else {
					var gamePath = gameInfo.executionPath;
					var indexRADS = gamePath.indexOf("RADS");
					var gameRoot;
					if (indexRADS > 0) {
						gameRoot = gamePath.substring(0, indexRADS);
					} else {
						// garena
						var gameRootDirGarena = "Game\\";
						var index = gamePath.indexOf(gameRootDirGarena) + gameRootDirGarena.length;
						gameRoot = gamePath.substring(0, index);
					}
					if (gameRoot.length == 0) {
						delete matchFetcher.gameRoot;
						def.reject("Could not find GameRoot - Neither RIOT nor Garena Client could be identified");
					} else {
						matchFetcher.gameRoot = gameRoot;
						debugLog("matchFetcher().getGameRoot(): GameRoot loaded. ", matchFetcher.gameRoot);
						def.resolve(gameRoot);
					}
				}
			});
		}
		return def.promise();
	},
	getActiveSummoner: function () {
		debugLog('getting active summoner');
		matchFetcher.throwIfNotReady();

		var def = $.Deferred();

		var foundSummonerName = false;

		matchFetcher.getActiveRegion()
			.then(function (region) {
				var isGarenaClient = false;
				if (region === 'garena') {
					isGarenaClient = true;
				}
				return getPreferencesPath(isGarenaClient)
					.then(getLatestFileInDirectory)
					.then(function (filename) {
						if (!filename.endsWith(".properties")) {
							debugLog("Couldn't find summoner name from file.");
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
							debugLog("My summoner (lowercase): " + mySummoner);
							def.resolve(mySummoner);
						} else {
							debugLog("Couldn't find summoner name from file.");
							def.reject("Couldn't find summoner name from file.");
						}
					})
					.fail(function (errMsg) {
						debugLog(errMsg);
						def.reject(errMsg)
					});
			});
		return def.promise();
	},
	getActiveRegion: function () { // needs to be chained after a method to check if in game and get the gameroot
		debugLog('getting active region');
		matchFetcher.throwIfNotReady();


		var def = $.Deferred();
		if (matchFetcher.region) {
			def.resolve(matchFetcher.region);
		} else {
			matchFetcher.getGameRoot().then(function (gameRoot) {
				getLatestFileInDirectory(gameRoot + "Logs/Patcher Logs/", "LoLPatcher.log")
					.then(function (filename) {

						debugLog('opened ' + filename);

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
							foundRegion = true;
							closeFile(fileId);
							matchFetcher.region = region.toLowerCase();
							debugLog('Found region ' + matchFetcher.region);
							def.resolve(matchFetcher.region);
						});
					})
					.fail(function (errMsg) {
						debugLog("Couldn't open logfile for Patcher - assuming Garena Client");
						matchFetcher.region = 'garena';
						def.resolve(matchFetcher.region);
					});
			});
		}

		return def.promise();
	},
	getMatchInfo: function () {
		debugLog('getting match info');

		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		var result = new Result();
		result.status = "error";

		$.when(matchFetcher.getActiveRegion())
			.then(function (region) {
				$.when(matchFetcher.getGameLogFilePath(), matchFetcher.getActiveSummoner())
					.then(collectParticipantsData)
					.then(function (matchInfo) {
						result.status = "success";
						result.errorMessage = null;
						result.matchInfo = matchInfo;
						debugLog("success: ", matchInfo);
						def.resolve(result);
					})
					.fail(function (errorMsg) {
						result.errorMessage = errorMsg;
						debugLog(errorMsg);
						def.reject(errorMsg);
					});
			});
		return def.promise();
	},
	getGameLogFilePath: function () { // cached
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		if (matchFetcher.gameLogFilePath) {
			debugLog('using cached gameLogFilePath: ', matchFetcher.gameLogFilePath);
			def.resolve(matchFetcher.gameLogFilePath);
		} else {
			debugLog('getting gameLogFilePath from files');
			var path = 'Logs/Game - R3d Logs/';
			matchFetcher.getGameRoot().then(function (gameRoot) {
				return getLatestFileInDirectory(gameRoot + path).then(function (filename) {
					matchFetcher.gameLogFilePath = gameRoot + path + filename;
					def.resolve(matchFetcher.gameLogFilePath);
				});
			}).fail(function () {
				console.warn('getGameLogFilePath failed');
				def.reject('getGameLogFilePath failed');
			});
		}
		return def.promise();
	},
	/** User spectates his own game */
	isReplay: function () {
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		matchFetcher.getGameRoot().then(isReplayClient).then(function (isReplayClient) {
			if (isReplayClient) {
				isUserReplay().then(function (isUserReplay) {
					def.resolve(isUserReplay);
				});
			} else {
				def.resolve(false);
			}
		}).fail(function (errMsg) {
			debugLog('isReplay failed');
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
	debugLog("Closing file " + fileId + " in 2000 MS...");
	setTimeout(function () {
		plugin().stopFileListen(fileId);
		debugLog("File listener closed.");
	}, 2000);
}

// getMatchInfo(function(res) {
//     debugLog(res);
// });
//
///**
// * @param {Object} data
// * @param {string} data.latestAirClientVersion
// * @param {string} data.gameRoot
// * @deprecated
// */
//function addFilenameAndSummonerToData(data) { // TODO: rename appropriatly
//	var def = $.Deferred();
//
//	matchFetcher.getActiveSummoner()
//		.then(function (mySummoner) {
//			getLatestFileInDirectory(data.gameRoot + "Logs/Game - R3d Logs/")
//				.then(function (filename) {
//					data.mySummoner = mySummoner;
//					data.filename = filename;
//					def.resolve(data);
//				})
//				.fail(function (errMsg) {
//						debugLog(errMsg);
//						def.reject(errMsg);
//					}
//				);
//		});
//	return def.promise();
//}

/**
 *
 * @param isGarenaClient
 * @returns {Promise} resolves into the full path to the preferences Folder of the Client
 */
function getPreferencesPath(isGarenaClient) {
	var def = $.Deferred();
	matchFetcher.getGameRoot()
		.then(function (gameRoot) {
			var root;
			if (isGarenaClient) {
				root = gameRoot.replace('\\Game\\', '');
				def.resolve(root + "/Air/preferences/");
			} else {
				root = gameRoot;
				return getAirClientVersion(root).then(
					function (latestAirClientVersion) {
						def.resolve(root + "RADS/projects/lol_air_client/releases/" + latestAirClientVersion + "/deploy/preferences/");
					}
				);
			}
		}).fail(function (errMsg) {
		debugLog(errMsg);
		def.reject(errMsg)
	});
	return def.promise();
}
function isGameLogSpawningFinished(lineDataString) {
	return lineDataString.includes(GAME_LOG_5v5_SPAWNING_DONE_MARK);
}
/**
 * @param latestGameLogFullPath
 * @param mySummoner
 */
function collectParticipantsData(latestGameLogFullPath, mySummoner) {
	var def = $.Deferred();
	var regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/;
	var lines = [];
	var foundMySummoner = false;
	var myTeam;
	var matchInfo = new MatchInfo();
	var fileListenerIsClosing = false;

	plugin().listenOnFile(GAME_LOG_FILE_ID, latestGameLogFullPath, false, function (id, status, fileData) {
		if (DEBUG) { console.warn(fileData); }
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
			debugLog('Matchdata is ready');

			if (foundMySummoner) {
				matchInfo.containsMyself = true;
				debugLog("User is present in this game (playing or replay)", matchInfo);
			} else {
				matchInfo.containsMyself = false; // spectating someone
				debugLog("User is spectating someone else", matchInfo);
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
		if (line.champion === 'MonkeyKing') {
			line.champion = 'Wukong'
		}
		line.team = matches[2];
		line.summoner = matches[4];

		lines.push(line);

		debugLog("Found line for summoner: " + line.summoner);

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

		if (line.summoner.toLowerCase() == mySummoner.toLowerCase() || unescape(encodeURIComponent(line.summoner)).toLowerCase() == mySummoner.toLowerCase()) { // TODO: ???
			myTeam = line.team;
			matchInfo.myChampion = line.champion;
			foundMySummoner = true;
			debugLog("Found my summoner in match.");
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
			debugLog("Found latest air client version: " + latestAirClientVersion);
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
				debugLog('Summoner found in Match, it\'s a replay');
				def.resolve(true);
				return;
			}

			if (isGameLogSpawningFinished(fileData)) {
				fileListenerIsClosing = true;
				closeFile(fileId);
				debugLog('Summoner not found in Match, it\'s a spectate');
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
			def.reject("Unable to open any file for path " + dir + searchTerm);
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
					debugLog('Match is in Replay Mode');
					def.resolve(true);
					return;
				}

				if (fileData.includes(GAME_LOG_CHECK_FOR_REPLAY_END)) {
					fileListenerIsClosing = true;
					closeFile(fileId);
					debugLog('Match is an actual game, no replay mode indicator found');
					def.resolve(false);
					return;
				}
			});
		})
		.fail(function () {
			debugLog(errMsg);
			def.reject(errMsg);
		});
	return def.promise();
}

function debugLog(msg, obj) {
	if (DEBUG) {
		if (typeof obj === 'undefined'){
			console.log(msg);
		}else {
			console.log(msg, obj);
		}
	}
}

export default matchFetcher;