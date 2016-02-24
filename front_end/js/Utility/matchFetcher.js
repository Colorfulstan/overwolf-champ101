import $ from 'jquery'

var isReady = $.Deferred();
var GLOBAL_FILE_ID = "currGameLog";
var matchFetcher = {
	isReady: isReady.promise(),
	initRan: false,

	init: function () {
		steal.log('initialising matchFetcher..........');
		steal.log('adding simpleIOplugin to DOM.........');
		$('body').append('<embed id="plugin" type="application/x-simple-io-plugin" width=0px height=0px/>');
		navigator.plugins.refresh(false);

		setInterval(function() { // TODO: what is this for?
			var a = document.getElementById("plugin");
			var b = document.querySelector("#plugin");
		}, 1000);

		this.initRan = true;
		setReady();
	},
	throwIfNotReady(){
		if (this.initRan === false) {throw new Error('analytics is not initialised. run .init() before sending data!')}
	},
	getActiveSummoner: function () {
		var def = $.Deferred();

		var foundSummonerName = false;

		plugin().getLatestFileInDirectory(data.gameRoot + "RADS/projects/lol_air_client/releases/" + data.latestAirClientVersion + "/deploy/preferences/*",
			function(status, filename) {
			if (!status || !filename.endsWith(".properties")) {
				result.errorMessage = "Couldn't find summoner name from file.";
				console.log("Couldn't find summoner name from file.");
				def.reject(result.errorMessage);
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
				result.errorMessage = "Couldn't find summoner name from file.";
				console.log("Couldn't find summoner name from file.");
				def.reject(result.errorMessage);
			}
		});

		return def.promise();
	}
};


//region Data-Objects
function Result() {
	this.status = "error";
	this.errorMessage = "";
	this.matchInfo = null;
}

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


function closeFile() {
	console.log("Closing file in 2 seconds...");
	setTimeout(function(){
		plugin().stopFileListen(GLOBAL_FILE_ID);
		console.log("File listener closed.");
	}, 2000);
}

// getMatchInfo(function(res) {
//     console.log(res);
// });

function getMatchInfo() {
	var def = $.Deferred();
	var result = new Result();
	result.status = "error";

	overwolf.games.getRunningGameInfo(function(gameInfo) {
		if (gameInfo == null || parseInt(gameInfo.id / 10) != 5426) {
			console.log("Not in game.");
			result.errorMessage = "Not in game.";
			def.reject("Not in game.");
		} else if (plugin() == null) {
			console.log("Plugin not loaded.");
			result.errorMessage = "Plugin not loaded.";
			def.reject("Plugin not loaded.");
		} else {
			console.log("Plugin loaded.");

			var gamePath = gameInfo.executionPath;
			var gameRoot = gamePath.substring(0, gamePath.indexOf("RADS"));

			checkForAirClient(gameRoot)
				.then(addFilenameAndSummonerToData)
				.then(collectParticipantsData)
				.then(function(matchInfo){
					result.status = "success";
					result.errorMessage = null;
					result.matchInfo = matchInfo;

					console.log("success: " + matchInfo);
					def.resolve(result);
				})
				.fail(function(errorMsg){
					result.errorMessage = errorMsg;
					console.log(errorMsg);
					def.reject(errorMsg);
				})
		}
	});
	return def.promise();
}

/**
 * @param {Object} data
 * @param {string} data.latestAirClientVersion
 * @param {string} data.gameRoot
 */
function addFilenameAndSummonerToData(data){ // TODO: rename appropriatly
	var def = $.Deferred();

	matchFetcher.getActiveSummoner()
		.then(function (mySummoner) {
		plugin().getLatestFileInDirectory(data.gameRoot + "Logs/Game - R3d Logs/*", function(status, filename) {
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
function collectParticipantsData(data){

	var def = $.Deferred();

	var regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/;
	var lines = [];
	var foundMySummoner = false;
	var myTeam;
	var matchInfo = new MatchInfo();

	plugin().listenOnFile(GLOBAL_FILE_ID, data.gameRoot + "Logs/Game - R3d Logs/" + data.filename, false, function(id, status, fileData) {
		if (lines.length == 10) { // TODO: what does this mean?
			return; // not processing anything after 10 valid lines found
		}

		if (id != GLOBAL_FILE_ID || !status) {
			closeFile();
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
				closeFile();
				def.reject("Found 10 summoners but did not find my summoner.");
				return;
			}

			console.log("Match info ready.", match);
			closeFile();
			def.resolve(matchInfo);
		}
	});

	return def.promise();
}

/**
 * return Promise - resolves into {{string} gameroot, {string} latestAirClientVersion}
 */
function checkForAirClient(gameRoot){
	var def = $.Deferred();

	var latestAirClientVersion = "0";

	plugin().listDirectory(gameRoot + "RADS/projects/lol_air_client/releases/*", function(status, listing) {
		var foundLatestAirClientVersion = false;
		var res = JSON.parse(listing);

		var maxVer = "0";

		res.forEach(function(file) {
			if (file.type == "dir" && file.name > maxVer) {
				maxVer = file.name;
				foundLatestAirClientVersion = true;
			}
		});

		if (foundLatestAirClientVersion) {
			latestAirClientVersion = maxVer;
			console.log("Found latest air client version: " + latestAirClientVersion);
			data = {
				gameRoot: gameRoot,
				latestAirClientVersion : latestAirClientVersion
			};
			def.resolve(data);
		} else {
			def.reject("Couldn't find latest air client version.")
		}
	});
	return def.promise();
}

export default matchFetcher;