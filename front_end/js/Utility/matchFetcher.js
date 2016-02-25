import $ from 'jquery'

var PLUGIN_ID = 'plugin';

var isReady = $.Deferred();
var GLOBAL_GAME_LOG_FILE_ID = "currGameLog";
var matchFetcher = {
	isReady: isReady.promise(),
	initRan: false,

	init: function () {
		console.log('initialising matchFetcher..........');
		console.log('adding simpleIOplugin to DOM.........');
		$('body').append('<embed id="' + PLUGIN_ID + '" type="application/x-simple-io-plugin" width=0px height=0px/>');
		navigator.plugins.refresh(false);

		setInterval(function () { // TODO: what is this for? Some kind of hack-fix, not sure if neccessary
			var a = document.getElementById(PLUGIN_ID);
			var b = document.querySelector("#" + PLUGIN_ID);
		}, 1000);

		this.initRan = true;
		setReady();
	},
	throwIfNotReady(){
		if (this.initRan === false) {throw new Error('matchFetcher is not initialised. run .init() before sending data!')}
	},
	getGameRoot: function () {
		matchFetcher.throwIfNotReady();
		var def = $.Deferred();
		overwolf.games.getRunningGameInfo(function (gameInfo) {
			if (gameInfo == null || parseInt(gameInfo.id / 10) != 5426) {
				console.log("Not in game.");
				def.reject("Not in game.");
			} else if (plugin() == null) {
				console.log("Plugin not loaded.");
				def.reject("Plugin not loaded.");
			} else {
				console.log("Plugin loaded.");
				var gamePath = gameInfo.executionPath;
				var gameRoot = gamePath.substring(0, gamePath.indexOf("RADS"));
				def.resolve(gameRoot);
			}
		});
		return def.promise();
	},
	/**
	 *
	 * @param data
	 * @param data.gameRoot
	 * @param data.latestAirClientVersion
	 * @returns {*}
	 */
	getActiveSummoner: function (data) {
		matchFetcher.throwIfNotReady();

		var def = $.Deferred();

		var foundSummonerName = false;

		matchFetcher.getGameRoot().then(function (gameRoot) {
			return getAirClientVersion(gameRoot).then(
				function (latestAirClientVersion) {
					plugin().getLatestFileInDirectory(gameRoot + "RADS/projects/lol_air_client/releases/" + latestAirClientVersion + "/deploy/preferences/*",
						function (status, filename) {
							if (!status || !filename.endsWith(".properties")) {
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
			plugin().getLatestFileInDirectory(gameRoot + "Logs/Patcher Logs/*LoLPatcher.log", function (status, filename) {
				if (!status) {
					console.log("Couldn't open logfile for Patcher - assuming Garena Client");
					def.resolve('garena');
					return;
				}

				console.log('opened ' + filename);

				var lineStartString = 'common.region: ';
				var region = '';
				var foundRegion = false;
				plugin().listenOnFile('patcherLog', gameRoot + "Logs/Patcher Logs/" + filename, false, function (id, status, fileData) {

					if (id != 'patcherLog' || !status || foundRegion) {
						return;
					}

					if (!fileData.includes("common.region")) {
						return;
					}

					region = fileData.substring(lineStartString.length);
					console.log('Found region ' + region);
					foundRegion = true;
					closeFile(id);
					def.resolve(region.toLowerCase());
				});
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
	this.myChampion = "";

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
	console.log("Closing file " + fileId + " in 2 seconds...");
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
			plugin().getLatestFileInDirectory(data.gameRoot + "Logs/Game - R3d Logs/*", function (status, filename) {
				if (!status) {
					result.errorMessage = "Couldn't open match info file.";
					console.log("Couldn't open match info file.");
					def.reject(result.errorMessage);
					return;
				}

				data.mySummoner = mySummoner;
				data.filename = filename;
				def.resolve(data);
			});
		});
	return def.promise();
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

	plugin().listenOnFile(GLOBAL_GAME_LOG_FILE_ID, data.gameRoot + "Logs/Game - R3d Logs/" + data.filename, false, function (id, status, fileData) {
		if (lines.length == 10) { // TODO: what does this mean?
			return; // not processing anything after 10 valid lines found
		}

		if (id != GLOBAL_GAME_LOG_FILE_ID || !status) {
			closeFile(id);
			def.reject("Couldn't find match info from file.");
			return;
		}

		if (!fileData.includes("Spawning champion")) {
			return;
		}

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

		console.log(matchInfo); // TODO: TESTING INFO

		if (line.summoner.toLowerCase() == data.mySummoner.toLowerCase() || unescape(encodeURIComponent(line.summoner)).toLowerCase() == data.mySummoner.toLowerCase()) {
			myTeam = line.team;
			matchInfo.myChampion = line.champion;
			foundMySummoner = true;
			console.log("Found my summoner in match.");
		}

		if (lines.length == 10) {
			if (!foundMySummoner) {
				closeFile(GLOBAL_GAME_LOG_FILE_ID);
				//def.reject("Found 10 summoners but did not find my summoner.");
				def.resolve(matchInfo); // TODO: remove again - testing purpose
				return;
			}

			console.log("Match info ready.", matchInfo);
			closeFile(GLOBAL_GAME_LOG_FILE_ID);
			def.resolve(matchInfo);
		}
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

export default matchFetcher;