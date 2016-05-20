import $ from 'jquery';

// TODO: integrate good logger and replace console and debugLog calls

var DEBUG = false;

var PLUGIN_ID = 'plugin';
var PLUGIN_VERSION = '1-1-1-3';
var PLUGIN_CHECK_READY_INTERVAL_MS = 50;
var PLUGIN_TIMEOUT_MS = 10000;

var MSG_NOT_IN_GAME = "Not in game.";
// TODO: rename module to something more fitting

var isReady = $.Deferred();
var GAME_LOG_5v5_SPAWNING_DONE_MARK = 'GAMESTATE_GAMELOOP Begin'; // both in replay and live safe way // works in 3v3 custom game - TODO: test in live games 3v3?
//var GAME_LOG_ALT_SPAWNING_DONE_MARK = 'Finished spawning heroes/minions'; // NOTE: can appear before all champs spawned!
/** If there is no line with 'replay mode' until the hardware section, its played game */
var GAME_LOG_CHECK_FOR_REPLAY_END = '-----HARDWARE INFORMATION START-----';
var GAME_LOG_REPLAY_INDICATOR = 'Replay mode';
var PATCHER_LOG_END_INDICATOR = 'event_name: app_start'; // pretty early but after neccessary informations

var matchFetcher = {
	isReady: isReady.promise(),
	initRan: false,
	/** indicator if plugin currently is processing something where no other API calls can be made (listenOnFile for time being)
	 * gets set to true when calling listenToFile() and set to false when calling closeFile().*/
	isPluginInUse: false,
	logCache: {
		'game': [],
		'patcher': []
	},

	/**
	 * Contains sideeffects!
	 * @see {@link setReady}
	 * @returns {Promise} resolves to true when matchFetcher is ready
	 */
	init: function () {
		if (!this.initRan) {
			debugLog('initialising matchFetcher..........');

			debugLog('adding simpleIOplugin to DOM.........');
			$('body').append('<embed id="' + PLUGIN_ID + '" type="application/x-simple-io-plugin-' + PLUGIN_VERSION + '" width="0px" height="0px" style="position: absolute; pointer-events: none" />');
			navigator.plugins.refresh(false);
			setInterval(function () { // TODO: what is this for? Some kind of hack-fix, not sure if neccessary
				document.getElementById('plugin');
			}, 1000);

			this.initRan = true;
			setReady();
		}
		return this.isReady;
	},
	getGameLogCache: function () {
		var def = $.Deferred();
		matchFetcher.getGameLogFilePath().then(function (gameLogPath) {
			waitForPlugin(PLUGIN_CHECK_READY_INTERVAL_MS, PLUGIN_TIMEOUT_MS).then(function () {
					cacheLog('game', gameLogPath, GAME_LOG_5v5_SPAWNING_DONE_MARK)
						.then(function (logCache) {
							def.resolve(logCache);
						});
				}
			);
		});
		return def.promise();
	},
	getPatcherLogCache: function () {
		var def = $.Deferred();
		matchFetcher.getPatcherLogFilePath().then(function (patcherLogPath) {
			return waitForPlugin(PLUGIN_CHECK_READY_INTERVAL_MS, PLUGIN_TIMEOUT_MS).then(function () {
				cacheLog('patcher', patcherLogPath, PATCHER_LOG_END_INDICATOR)
					.then(function (logCache) {
						def.resolve(logCache);
					});
			});
		}).fail(function (errMsg) {
			def.reject(errMsg);
		});
		return def.promise();
	},
	/**
	 * @deprecated replace with "initIfNeccessary" (NYI)
	 */
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
					if (DEBUG) {
						matchFetcher.gameRoot = 'C:/Games/league/';
						debugLog("matchFetcher().getGameRoot(): Not in game but in DEBUG mode, using fix path.");
						def.resolve(matchFetcher.gameRoot);
					} else {
						debugLog("matchFetcher().getGameRoot(): Not in game.");
						def.reject(MSG_NOT_IN_GAME);
					}
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
						var errMsg = "Could not find GameRoot - Neither RIOT nor Garena Client could be identified";
						def.reject();
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
					});
			})
			.fail(function (errMsg) {
				debugLog('matchFetcher.getActiveSummoner():' + errMsg);
				def.reject(errMsg)
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
			var lineStartString = 'common.region: ';
			var region = '';
			var foundRegion = false;
			matchFetcher.getPatcherLogCache().then(function (patcherLogCache) {
					// TODO: known issue: only the region the client had set when opened will be found with this.
					// i.e. if the user changes the server-region without restarting the client, the old region will be used to get the data
					for (var i = 0; i < patcherLogCache.length && !foundRegion; i++) {
						var lineData = patcherLogCache[i];

						if (lineData.includes("common.region")) {
							region = lineData.substring(lineStartString.length);
							foundRegion = true;
							matchFetcher.region = region.toLowerCase();
							debugLog('Found region ' + matchFetcher.region);
							def.resolve(matchFetcher.region);
						}
					}
					if (!foundRegion) {
						delete matchFetcher.region;
						def.reject('could not find region from patcherLog');
					}
				})
				.fail(function (errMsg) {
					// TODO: currently means that when someone opens the matchwindow outside of a game their server will be set to garena bc no gameroot can be found!
					debugger;
					if (errMsg === MSG_NOT_IN_GAME){
						debugLog("No Running Game - can't determine server");
						matchFetcher.region = 'undefined';
					} else {
						debugLog("Couldn't open logfile for Patcher - assuming Garena Client");
						matchFetcher.region = 'garena';
					}
					def.resolve(matchFetcher.region);
				});
		}

		return def.promise();
	},
	getPatcherLogFilePath: function () {
		var def = $.Deferred();
		if (matchFetcher.patcherLogFilePath) {
			def.resolve(matchFetcher.patcherLogFilePath);
		} else {
			matchFetcher.getGameRoot().then(function (gameRoot) {
					return getLatestFileInDirectory(gameRoot + "Logs/Patcher Logs/", "LoLPatcher.log")
						.then(function (fileName) {
							matchFetcher.patcherLogFilePath = gameRoot + "Logs/Patcher Logs/" + fileName;
							def.resolve(matchFetcher.patcherLogFilePath);
						});
				})
				.fail(function (errMsg) {
					debugLog(errMsg);
					delete matchFetcher.patcherLogFilePath;
					def.reject(errMsg);
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

		matchFetcher.getActiveSummoner()
			.then(collectParticipantsData)
			.then(function (matchInfo) {
				result.status = "success";
				result.errorMessage = null;
				result.matchInfo = matchInfo;
				debugLog("success: ", matchInfo);
				def.resolve(result);
			}).fail(function (errorMsg) {
			result.errorMessage = errorMsg;
			debugLog(errorMsg);
			def.reject(errorMsg);
		});
		return def.promise();
	}
	,
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
				debugLog('getGameLogFilePath failed');
				def.reject('getGameLogFilePath failed');
			});
		}
		return def.promise();
	}
	,
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
	}
	,
	/** User spectates someone other */
	isSpectate: function () {
		matchFetcher.throwIfNotReady();
		return matchFetcher.getGameRoot().then(isReplayClient);
	}
	,
	isReplayOrSpectate: function () {
		return matchFetcher.init().then(matchFetcher.isSpectate);
	}
};


/**
 * resolves when the plugin is not used anymore.
 * rejected after the given timeout.
 * Should be chained before any other method to ensure
 */
function waitForPlugin(intervallMs, timeoutMs) {
	var def = $.Deferred();
	var passedTimeMs = 0;
	var ival = window.setInterval(function () {
		if (passedTimeMs > timeoutMs) {
			def.reject('matchFetcher.waitForPlugin() timed out after' + passedTimeMs + 'MS');
			window.clearInterval(ival);
		} else if (!matchFetcher.isPluginInUse) {
			window.clearInterval(ival);
			def.resolve(true);
		}
		passedTimeMs += intervallMs;
	}, intervallMs);
	return def.promise();
}

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

function cacheLog(type, path, endIndicator) {
	var def = $.Deferred();
	var fileId = type + 'Log';
	var closingFile = false;
	var logCache = matchFetcher.logCache[type];


	if (logCache.length > 0) {
		def.resolve(logCache); // TODO: gets cleaned up when a new match begins, otherwise some cache validation would be neccessary
	} else {
		matchFetcher.isBusy = true;
		var skipToEndOfFile = false;
		listenOnFile(fileId, path, skipToEndOfFile, function (id, status, lineData) {
			if (closingFile) {
				return;
			}
			if (id != fileId || !status) {
				closingFile = true;
				closeFile(fileId).always(function () {
					def.reject("Couldn't find info from file.");
				});
				return;
			}

			var l = logCache.length;
			var lineText = lineData.substring(lineData.lastIndexOf('|') + 1); // if no | is found, index will be 0
			if (logCache[l - 1] !== lineText) {
				//if (DEBUG) { console.warn(lineData); }
				logCache.push(lineText);
			}
			if (!closingFile && lineText.includes(endIndicator)) {
				closingFile = true;
				closeFile(fileId).then(function () {
					def.resolve(logCache);
				}).fail(function (errMsg) {
					debugLog('matchFetcher.cacheLog(): couldn\'t close file listener. ' + errMsg);
					def.reject(errMsg);
				});
			}
		});
	}
	return def.promise();
}

function plugin() {
	return document.getElementById('plugin');
}
function listenOnFile(fileId, path, bool, callback) {
	matchFetcher.isPluginInUse = true;
	plugin().listenOnFile(fileId, path, bool, callback);
}
function setReady() {
	isReady.resolve(true);
	isReady = null;
}

function closeFile(fileId) {
	var def = $.Deferred();
	debugLog("Closing file " + fileId + " in 2000 MS...");
	setTimeout(function () {
		try {
			plugin().stopFileListen(fileId);
			debugLog("File listener closed.");
		} catch (e) {
			//plugin().stopFileListen(fileId);
			if (DEBUG) console.warn("Error closing File listener for fileId: " + fileId, e);
		} finally {
			debugLog('closeFile() moving on...');
			matchFetcher.isPluginInUse = false;
			def.resolve(true);
		}
	}, 2000); // timing is crucial! Too little time and there will be an error trying to calling stopFileListen() - 2 seconds seem to be a safe amount
	return def.promise();
}

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
				root = gameRoot.replace('\\Game\\', '\\');
				def.resolve(root + "Air/preferences/");
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
/**@deprecated cacheGameLog already has an argument for end indicator */
function isGameLogSpawningFinished(lineDataString) {
	return lineDataString.includes(GAME_LOG_5v5_SPAWNING_DONE_MARK);
}
/**
 * @param latestGameLogFullPath
 * @param mySummoner
 */
function collectParticipantsData(mySummoner) {
	var def = $.Deferred();
	var regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/;
	var lines = [];
	var foundMySummoner = false;
	var myTeam;
	var matchInfo = new MatchInfo();
	var stopLoop = false;
	matchFetcher.getGameLogCache().then(function (gameLogCache) {

		for (var i = 0; i < gameLogCache.length && !stopLoop; i++) {
			var lineData = gameLogCache[i];

			//region condition-checks
			var allParticipantsRead = (lines.length == 10 || i == gameLogCache.length - 1);
			if (allParticipantsRead) {
				debugLog('Matchdata is ready');

				if (foundMySummoner) {
					matchInfo.containsMyself = true;
					debugLog("User is present in this game (playing or replay)", matchInfo);
				} else {
					matchInfo.containsMyself = false; // spectating someone
					debugLog("User is spectating someone else", matchInfo);
				}
				def.resolve(matchInfo);
				stopLoop = true; // break;
			}

			if (!lineData.includes("Spawning champion")) {
				continue; // return
			}
			//endregion

			//region logic
			var matches = regEx.exec(lineData);

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
		}
	});

	return def.promise();
}

/**
 * return Promise - resolves into {string} latestAirClientVersion}
 */
function getAirClientVersion(gameRoot) {
	var def = $.Deferred();

	var latestAirClientVersion = "0";

	plugin().listDirectory(gameRoot + "RADS/projects/lol_air_client/releases/*", function (status, listing) {
		matchFetcher.isPluginInUse = false;
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

	var stopLoop = false;

	$.when(matchFetcher.getActiveSummoner()).then(function (summoner) {
		matchFetcher.getGameLogCache().then(function (gameLogCache) {
			for (var i = 0; i < gameLogCache.length && !stopLoop; i++) {
				var lineData = gameLogCache[i];
				if (lineData.toLowerCase().includes(summoner)) {
					debugLog('Summoner found in Match, it\'s a replay');
					def.resolve(true);
					stopLoop = true;
				}
			}
			if (!stopLoop) { // gameLogCache got searched through completely
				debugLog('Summoner not found in Match, it\'s a spectate');
				def.resolve(false);
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
	var stopLoop = false;
	matchFetcher.getGameLogCache().then(function (gameLogCache) {
		for (var i = 0; i < gameLogCache.length && !stopLoop; i++) {
			var lineData = gameLogCache[i];

			if (lineData.includes(GAME_LOG_REPLAY_INDICATOR)) {
				debugLog('Match is in Replay Mode');
				def.resolve(true);
				stopLoop = true;
			} else if (lineData.includes(GAME_LOG_CHECK_FOR_REPLAY_END)) {
				debugLog('Match is an actual game, no replay mode indicator found');
				def.resolve(false);
				stopLoop = true;
			}
		}
	});
	return def.promise();
}

function debugLog(msg, obj) {
	if (DEBUG) {
		if (typeof obj === 'undefined') {
			console.log(msg);
		} else {
			console.log(msg, obj);
		}
	}
}

export default matchFetcher;