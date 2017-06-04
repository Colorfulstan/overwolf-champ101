export class MatchInfo {
	constructor(myChampion = null,
				mySummonerName = null,
				containsMyself = false,
				team_100 = [],
				team_200 = [],
				alliedTeamKey,
				enemyTeamKey) {
		this.myChampion = myChampion || null
		this.mySummonerName = mySummonerName || null
		this.containsMyself = containsMyself  || false
		this.team_100 = team_100 || []
		this.team_200 = team_200 || []
		this.alliedTeamKey = alliedTeamKey
		this.enemyTeamKey = enemyTeamKey
	}
}
export class LineInfo {

	constructor(champion = "",
				team = 0,
				summoner = "",
				clientId = null) {
		this.champion = champion || ""
		this.team = team || 0
		this.summoner = summoner || ""
		this.clientId = clientId || null
	}
}
export class Result {
	constructor(status = 'error', errorMessage = '', matchInfo = null) {
		this.status = status || 'error'
		this.errorMessage = errorMessage || ''
		this.matchInfo = matchInfo || null
	}
}

export class OwIoLolService {
	constructor($log,
				owSdk,
				simpleIOPlugin) {
		// migrating steal.dev.log / .warn
		// this.$log = {
		// 	log: $log.log,
		// 	debug: $log.log,
		// 	info: $log.log,
		// 	error: $log.warn,
		// 	warn: $log.warn
		// }
		this.$log = $log

		this.owSdk = owSdk
		this.simpleIOPlugin = simpleIOPlugin


		/** @private */
		this.MSG_NOT_IN_GAME = "Not in game."

		/** @private */
		this.GAME_LOG_5v5_SPAWNING_DONE_MARK = 'GAMESTATE_GAMELOOP Begin'; // both in replay and live safe way // works in 3v3 custom game
		/** @private */
		// GAME_LOG_ALT_SPAWNING_DONE_MARK = 'Finished spawning heroes/minions'; // NOTE: can appear before all champs spawned!
		/** If there is no line with 'replay mode' until the hardware section, its played game */
		/** @private */
		this.GAME_LOG_CHECK_FOR_REPLAY_END = '-----HARDWARE INFORMATION START-----'
		/** @private */
		this.GAME_LOG_REPLAY_INDICATOR = 'Replay mode'


		/** @private */
		this.logCache = {
			game: [],
			/** @deprecated through deprecation of patcherlog use for region prediction */
			patcher: [],
			lolProperties: null,
			leagueClientSettings: null
		}
		// region Preparation

		// TODO: move into overwolf module, has nothing to do with IO but is overwolf specific. Divide into generic getGameRoot and specific for League within ow.lol module
		/** @private */
		this.gameRoot = null


		/** @private */
		this.lolPropertiesFilePath = null
		/** @private */
		this.leagueClientSettingsFilePath = null
		// needs to be chained after a method to check if in game and get the gameroot
		/** @private */
		this.region = null
		/** @private */
		this.matchStartTime = null
		/** @private */
		this.gameLogFilePath = null

	}
	getGameRoot() {
		if (this.gameRoot) {
			this.$log.info('Gameroot already set: ' + this.gameRoot);
			return Promise.resolve(this.gameRoot);
		} else {
			return this.gettingRunningGameInfo()
				.catch((err) => {
					this.$log.warn(err);
					this.$log.warn('trying to use GameInfo instead (out of game)');
					return this.gettingGameInfo(5426) // TODO: constant for League game
						.catch(newErr => {
							return Promise.reject(new Error(err.toString() + ' -> ' + newErr.toString()))
						})
				})
				.then((path) => {
					return this.gettingGameRootFromPath(path)
						.then((gameRoot) => {
							this.gameRoot = gameRoot;
							this.$log.debug("OwIoLolService.getGameRoot(): GameRoot loaded. ", this.gameRoot);
							return Promise.resolve(gameRoot);
						})
						.catch((err) => {
							this.gameRoot = null;
							const errMsg = err.toString() + " -> Could not find GameRoot - Neither RIOT nor Garena Client could be identified with certainty";
							return Promise.reject(new Error(errMsg));
						});
				})
				.catch((err) => {
					const errMsg = err.toString() + '-> unexpected Error while trying to get GameRoot'
					this.$log.debug(errMsg);
					return Promise.reject(new Error(errMsg));
				});
		}
	}

	gettingRunningGameInfo() { // TODO: move into OwGamesService
		return new Promise((resolveRunningGameInfo, rejectRunningGameInfo) => {
			this.owSdk.games.getRunningGameInfo((gameInfo) => {
				if (gameInfo == null || !gameInfo.id || Math.floor(gameInfo.id / 10) !== 5426) {
					this.$log.debug("OwIoLolService.getGameRoot(): Not in game.");
					rejectRunningGameInfo(new Error(this.MSG_NOT_IN_GAME));
				} else {
					resolveRunningGameInfo(gameInfo.executionPath);
				}
			});
		})
	}

	gettingGameInfo(gameId) { // TODO: move into OwGamesService
		return new Promise((resolveGameInfo, rejectGameInfo) => {
			this.$log.info('Trying to get gameroot from GameInfo');

			this.owSdk.games.getGameInfo(gameId, (result) => {
				this.$log.debug('got GameInfo' + JSON.stringify(result.gameInfo));
				if (result.status === 'success' && result.gameInfo && result.gameInfo.ProcessPath) {
					const processPath = result.gameInfo.ProcessPath;
					resolveGameInfo(processPath);
				} else {
					rejectGameInfo(new Error('Could not resolve League gamePath from getGameInfo ID 5426'))
				}
			});
		})
	}

	/** @private */
	gettingGameRootFromPath(path) {
		const lolLauncherPathIndex = path.indexOf('lol.launcher.exe');
		const indexRADS = path.indexOf("RADS/");

		const garenaLolExeIndex = path.indexOf('/lol.exe');
		const garenaRootDirIndicator = "Game/";
		const indexGarenaGame = path.indexOf(garenaRootDirIndicator);

		// exists on both riot and garena within the Game-Root we want to find
		const universalExistantFile = "Config/game.cfg"; // TODO: will this stay when new client is in use?

		let gameRoot, fileToCheckForExistence;
		if (lolLauncherPathIndex > -1) {
			gameRoot = path.substring(0, lolLauncherPathIndex);
			fileToCheckForExistence = path;
		} else if (indexRADS > -1) {
			// riot //
			gameRoot = path.substring(0, indexRADS);
			fileToCheckForExistence = gameRoot + universalExistantFile;
		} else if (indexGarenaGame > -1) {
			// garena // C:\Games\GarenaLol\GameData\Apps\LoL\Game
			gameRoot = path.substring(0, indexGarenaGame + garenaRootDirIndicator.length);
			fileToCheckForExistence = gameRoot + universalExistantFile;
		} else if (garenaLolExeIndex > -1) {
			// garena // C:\Games\GarenaLol\GameData\Apps\LoL\lol.exe
			gameRoot = path.substring(0, garenaLolExeIndex + 1) + garenaRootDirIndicator;
			fileToCheckForExistence = gameRoot + universalExistantFile;
		}

		return new Promise((resolve, reject) => {
			if (fileToCheckForExistence) {
				this.owSdk.io.fileExists(fileToCheckForExistence, (result) => { // TODO: move into OwIoService
					const pathExists = result.found;
					if (pathExists) {
						resolve(gameRoot);
					} else {
						reject(new Error('Found GameRoot "' + gameRoot + '" from path "' + path + '" does not seem to be right, could not find "' + universalExistantFile + '"'));
					}
				});
			} else {
				reject(new Error('given path is not known to be a league path: ' + path));
			}
		})
	}


	/** @private */
	getClientPropertiesFilePath() {
		if (this.lolPropertiesFilePath) {
			return Promise.resolve(this.lolPropertiesFilePath);
		} else {
			return this.getAirClientDeployPath().then((path) => {
				return this.simpleIOPlugin.getLatestFileInDirectory(path, 'lol.properties', true)
					.then((filePath) => {
						this.lolPropertiesFilePath = filePath
						return this.lolPropertiesFilePath
					})
			}).catch((errMsg) => {
					this.$log.debug(errMsg)
					this.lolPropertiesFilePath = null
					return Promise.reject(errMsg)
				}
			)
		}
	}


	/** @private */
	getLeagueClientSettingsFilePath() {
		if (this.leagueClientSettingsFilePath) {
			return Promise.resolve(this.leagueClientSettingsFilePath);
		} else {
			return this.getConfigPath().then((path) => {
				return this.simpleIOPlugin.getLatestFileInDirectory(path, 'LeagueClientSettings.yaml', true)
					.then((filePath) => {
						this.leagueClientSettingsFilePath = filePath
						return this.leagueClientSettingsFilePath
					})
			}).catch((errMsg) => {
					this.$log.debug(errMsg)
					this.leagueClientSettingsFilePath = null
					return Promise.reject(errMsg)
				}
			)
		}
	}

	/** @private */
	getConfigPath() {
		return this.getGameRoot().then(gameroot => {
			return gameroot + 'Config/'
		})
	}

	// endregion

	// region Information

	/**
	 *
	 * known issue:
	 * if multiple users use this computer, this method might return the wrong summoner
	 * If the summoner logs in the first time, the right summoner will be choosen.
	 * If the summoner did not change since the last played game on this computer, the right name will be choosen.
	 *
	 * However, if the summoner changed since the last played game and the now logged in summoner
	 * already played on this computer before, the wrong summoner will be choosen!
	 *
	 * TODO: implement workaround to minimize error-quote on this issue
	 * A possible workaround would be to CHECK IF THERE ARE MORE THEN 2 FILES (excluding folders)
	 * present within the directory. IF NOT, THEN THE LATEST FILE WILL BE GOOD ENOUGH.
	 * If there are more then 2 files however, then GET ALL SUMMONERNAMES PRESENT
	 * AND RETURN THEM AS ARRAY representing "known-summoners".
	 * So the APPLICATION HAS TO CHECK IF AN ARRAY OR A STRING IS RETURNED.
	 * If an array is returned and there is no active game for the summoner, try the next one.
	 * (build array in order of last modification of the file)
	 * If all of them are not found within a match, use gamelog for getting the summonername.
	 * @returns {*}
	 */
	getActiveSummoner() {
		this.$log.debug('getting active summoner');

		let foundSummonerName = false;

		return this.getActiveRegion()
			.then((region) => {
				return this.getPreferencesPath(region === 'garena')
			})
			.then((path) => this.simpleIOPlugin.getLatestFileInDirectory(path))
			.then((filename) => {
				if (!filename.endsWith(".properties")) {
					const errMsg = "Couldn't find summoner name from file."
					this.$log.debug(errMsg);
					throw new Error(errMsg)
				}
				if (filename.startsWith("shared_")) {
					filename = filename.substring("shared_".length)
				}
				filename = filename.substring(0, filename.indexOf("."))

				const mySummoner = filename
				this.$log.debug("My summoner (lowercase): " + mySummoner);
				return mySummoner
			})
			.catch((err) => {
				this.$log.debug('OwIoLolService.getActiveSummoner():' + err);
				throw err
			})
	}

	checkingIfIsGarena() {
		return this.getGameRoot()
			.then((gameRoot) => {
				return this.simpleIOPlugin.getLatestFileInDirectory(gameRoot + "Logs/Patcher Logs/", "LoLPatcher.log", true);
			})
			.then(() => {
				return false // expecting an error for Patcher-Log when Garena
			})
			.catch((err) => {
				// true if file (Patcher log) did not exist
				return err.toString().indexOf('Unable to open') !== -1
			});
	}

	/**
	 * Returns the platformId or RegionTag of the active player.
	 * Returns 'garena' if players is on servers not supported by the RIOT API.
	 * can only used when within a game
	 * @returns {Promise|string} the regionTag for the current Player (Summoner)
	 */


	getActiveRegion() {
		this.$log.debug('getting active region');
		if (this.region) {
			this.$log.debug('region already set: ' + this.region);

			return Promise.resolve(this.region)
		} else {
			return this.checkingIfIsGarena().then((isGarena) => {
				if (isGarena) {
					this.region = 'garena'
					return this.region
				} else {
					this.$log.debug('client is not garena')
					return this.checkingIfIsLCU()
						.then((isLCU) => {
							if (isLCU) {
								return this.getLeagueClientSettingsCache().then((data) => {
									// TODO: are LAS / LAN Regions right in this approach? (see below for
									// clientpropertiescache
									const regex = /region: "(.*)"/
									return [data, regex]
								})
							} else {
								return this.getClientPropertiesCache().then((data) => {

									// TODO: LAS / LAN Regions seem to arrive at the server as the platformID instead of the region-Tag even though getPlatformId is set to false
									const regex = /regionTag=(.*)/
									return [data, regex]
								})
							}
						})
				}
			}).then(([ data, regex ]) => {
				let region

				const matches = regex.exec(data);

				if (matches) {
					region = matches[1];
				} else {
					// TODO: what about new garena-client??
					region = 'garena'; // garena doesn't have regionTag or platformId line
				}
				this.$log.debug('region found: ' + region);
				return region
			}).catch((err) => {
				if (err.toString() === this.MSG_NOT_IN_GAME) {
					this.$log.debug("No Running Game - can't determine region");
					this.region = 'undefined';
					return this.region
				} else {
					throw err
				}
			})
		}
	}

	getMatchInfo(activeSummonerOrNull) {
		const mySummoner = activeSummonerOrNull
		this.$log.debug('OwIoLolService.getMatchInfo(): Summoner given: ' + mySummoner);
		this.$log.debug('getting match info');

		let result = new Result();
		result.status = "error";

		return this.collectParticipantsData()
			.then((matchInfo) => { // get data in relation to summoner

				if (mySummoner) {
					// interpretate matchdata in relation to active user
					let foundMySummoner = false;

					const teamKeysArr = Object.keys(matchInfo).filter((key) => key.indexOf('team_') !== -1);

					for (let i = 0; i < teamKeysArr.length; i++) {
						const teamKey = teamKeysArr[i];
						const team = matchInfo[teamKey];
						for (let j = 0; j < team.length; j++) {
							const summoner = team[j].summoner;
							const champion = team[j].champion;

							if (summoner.toLowerCase() === mySummoner.toLowerCase()) {
								foundMySummoner = true;
								matchInfo.myChampion = champion;
								this.$log.debug("OwIoLolService: my Champion: " + matchInfo.myChampion);

								matchInfo.mySummonerName = summoner;
								this.$log.debug("OwIoLolService: my Summoner: " + matchInfo.mySummonerName);

								matchInfo.enemyTeamKey = summoner;
								this.$log.debug("OwIoLolService: my Summoner: " + matchInfo.mySummonerName);

								matchInfo.alliedTeamKey = teamKey;
								this.$log.debug("OwIoLolService: alliedTeamKey: " + matchInfo.alliedTeamKey);

								matchInfo.enemyTeamKey = (i === 1) ? teamKeysArr[0] : teamKeysArr[1];
								this.$log.debug("OwIoLolService: enemyTeamKey: " + matchInfo.enemyTeamKey);
							}
						}
					}

					if (foundMySummoner) {
						matchInfo.containsMyself = true;
						this.$log.debug("User is present in this game (playing or replay)", matchInfo);
					} else {
						matchInfo.containsMyself = false; // spectating someone
						this.$log.debug("User is spectating someone else", matchInfo);
					}
				}
				return matchInfo
			})
			.then((matchInfo) => {
				result.status = "success";
				result.errorMessage = null;
				result.matchInfo = matchInfo;
				this.$log.debug("OwIoLolService.getMatchInfo(): success: ", matchInfo);
				return result
			})
			.catch((err) => {
				result.errorMessage = err.toString();
				this.$log.debug(err);
				throw err
			});
	}


	getMatchStartTime() {
		if (this.matchStartTime) {
			return Promise.resolve(this.matchStartTime)
		}
		return this.getGameLogCache()
			.then((logCache) => {
				const firstLine = logCache[0];
				const timestamp = firstLine.substr(firstLine.lastIndexOf(' ') + 1);
				const loggingStartedMS = new Date(timestamp).getTime() + (new Date().getTimezoneOffset() * 60 * 1000);

				let gamestartLine = "";

				for (let i = 0; i < logCache.length; i++) {
					const line = logCache[i];
					if (line.indexOf(this.GAME_LOG_5v5_SPAWNING_DONE_MARK) >= 0) {
						gamestartLine = line;
						break;
					}
				}

				if (gamestartLine === "") {
					throw new Error('OwIoLolService.getMatchStartTime(): Could not determine time of gamestart from Log!') // TODO: OwIoError
				} else {
					const durationUntilMatchStart = gamestartLine.substr(0, gamestartLine.indexOf('|'));
					const durationMS = parseFloat(durationUntilMatchStart) * 1000;
					this.matchStartTime = loggingStartedMS + durationMS;
					return this.matchStartTime
				}
			})
	}

	/** User spectates his own game */
	isReplay() {
		this.getGameRoot()
			.then(this.isReplayClient.bind(this))
			.then((isReplayClient) => {
				if (isReplayClient) {
					return this.isUserReplay()
				} else {
					return false
				}
			}).catch((err) => {
			this.$log.debug('isReplay failed');
			throw err
		})
	}

	/** User spectates someone other */
	isSpectate() {
		return this.getGameRoot().then(this.isReplayClient.bind(this));
	}

	isReplayOrSpectate() {
		return this.isSpectate();
	}

	/**
	 * Checks if the last used Client is the new LCU or the legacy client.
	 * It does so by checking the Config Folder within the gameRoot for the most recently updated file.
	 * If that file is not "LeagueClientSettings.yaml" it assumes the Legacy client is currently in use.
	 *
	 *
	 */
	checkingIfIsLCU() {
		this.$log.debug('checking if Client is LCU')
		return this.getConfigPath().then((configPath) => {
			return this.simpleIOPlugin.getLatestFileInDirectory(configPath)
		}).then((filename) => {
			this.$log.debug('latest modified config-file: ' + filename)
			return filename === 'LeagueClientSettings.yaml'
		})
	}

	// endregion

	/**
	 * Gets the path to the current Air-Client folder of the league client
	 * Contains settings for the league client used to login
	 * @param isGarenaClient
	 */
	/** @private */
	getAirClientDeployPath(isGarenaClient = false) {
		return this.getGameRoot()
			.then((gameRoot) => {
				let root;
				if (isGarenaClient) {
					root = gameRoot.replace('/Game/', '/');
					return root + "Air/"
				} else {
					root = gameRoot;
					return this.getAirClientVersion(root)
						.then((latestAirClientVersion) => root + "RADS/projects/lol_air_client/releases/" + latestAirClientVersion + "/deploy/")
				}
			}).catch((err) => {
				this.$log.debug(err);
				throw err
			})
	}

	/**
	 *
	 * @param isGarenaClient
	 * @returns {Promise} resolves into the full path to the preferences Folder of the Client
	 */
	/** @private */
	getPreferencesPath(isGarenaClient) {
		return this.getAirClientDeployPath(isGarenaClient)
			.then((deployPath) => deployPath + 'preferences/')
			.catch((err) => {
				this.$log.debug(err)
				throw err
			})
	}

	/**
	 * return Promise - resolves into {string} latestAirClientVersion}
	 */
	/** @private */
	getAirClientVersion(gameRoot) {
		return new Promise((resolve, reject) => {
			// TODO: move into simpleIOPlugin and return promise
			this.simpleIOPlugin.getPlugin()
				.listDirectory(gameRoot + "RADS/projects/lol_air_client/releases/*", (status, listing) => {
					this.simpleIOPlugin.isInUse = false;
					let foundLatestAirClientVersion = false;
					let highestVersion = "0.0.0.0";

					if (typeof listing == 'string') {
						listing = JSON.parse(listing)
					}
					listing.forEach((file) => {
						if (file.type == "dir" && this.isNextVersionStringBigger(highestVersion, file.name)) {
							highestVersion = file.name;
							foundLatestAirClientVersion = true;
						}
					})

					if (foundLatestAirClientVersion) {
						this.$log.debug("Found latest air client version: " + highestVersion);
						resolve(highestVersion);
					} else {
						reject(new Error("Couldn't find latest air client version."))
					}
				});
		})
	}

	/** @private */
	isNextVersionStringBigger(max, next) {
		const maxArr = max.split('.');
		const nextArr = next.split('.');

		// we assume the next version number is bigger until proven otherwise
		return maxArr.reduce((nextIsBigger, current, currIndex, array) => {
			// don't compare when next already proved to be lower
			// or if they are the same
			if (!nextIsBigger || (parseInt(current) === parseInt(nextArr[currIndex]))) return nextIsBigger
			return parseInt(current) < parseInt(nextArr[currIndex])
		}, true)
	}

	// region Caching

	/**
	 * Contains sideeffects!
	 * @returns {Promise} resolves to true when OwIoLolService is ready
	 */
	/** @private */
	getGameLogCache() {
		return this.simpleIOPlugin.refreshingPlugin()
			.then(() => this.getGameLogFilePath())
			.then((gameLogPath) => {
				return this.simpleIOPlugin.waitForPlugin()
					.then(() => this.cacheLog('game', gameLogPath, this.GAME_LOG_5v5_SPAWNING_DONE_MARK))
			})
	}

	/** @private */
	getClientPropertiesCache() {
		if (this.logCache.lolProperties) {
			return Promise.resolve(this.logCache.lolProperties);
		} else {
			return this.getClientPropertiesFilePath()
				.then((lolPropertiesFilePath) => {
					return this.simpleIOPlugin.waitForPlugin()
						.then(() => {
							// TODO: how to figure out when I need other encoding? For asian languages this might be neccessary to read files correctly
							return this.simpleIOPlugin.getTextFile(lolPropertiesFilePath, false)
								.then((data) => {
									this.$log.debug('loaded path: ', lolPropertiesFilePath, 'with data', data);
									this.logCache.lolProperties = data;
									return data
								})
								.catch((err) => {
									this.$log.debug(err);
									throw err
								});
						})
				})
		}
	}


	/** @private */
	getGameLogFilePath() {
		if (this.gameLogFilePath) {
			this.$log.debug('using cached gameLogFilePath: ', this.gameLogFilePath);
			return Promise.resolve(this.gameLogFilePath);
		} else {
			this.$log.debug('getting gameLogFilePath from files');
			const path = 'Logs/Game - R3d Logs/';
			return this.getGameRoot()
				.then((gameRoot) => {
					return this.simpleIOPlugin.getLatestFileInDirectory(gameRoot + path, null, true)
				})
				.then((filepath) => {
					this.gameLogFilePath = filepath;
					return this.gameLogFilePath
				})
				.catch((err) => {
					const message = 'getGameLogFilePath failed -> ' + err.toString();
					this.$log.debug(message);
					throw new Error(message)
				});
		}
	}

	/** @private */
	cacheLog(type, path, endIndicator) {
		this.$log.debug('starting to cache game-log ' + type + ' ' + path + ' ' + endIndicator);
		return new Promise((resolve, reject) => { // TODO: make this a stream (rxjs)
			const fileId = type + 'Log';
			const logCache = this.logCache[type];
			let closingFile = false;

			if (logCache.length > 0) {
				this.$log.debug('OwIoLolService: finished caching game-log (using cached)');
				resolve(logCache); // gets cleaned up when a new match begins (the app restarts), otherwise some cache validation would be neccessary
			} else {
				let skipToEndOfFile = false;

				this.simpleIOPlugin.listenOnFile(fileId, path, skipToEndOfFile, (id, status, lineData) => {
					if (closingFile) {
						return;
					}
					if (id != fileId || !status) {
						closingFile = true;
						this.simpleIOPlugin.closeFile(fileId).catch(() => true).then(() => reject("Couldn't find info" +
							" from file."));
						return;
					}

					const l = logCache.length;
					const lineText = lineData.substring(lineData.lastIndexOf('|') + 1); // if no | is found, index will be 0
					if (logCache[l - 1] !== lineText) {
						logCache.push(lineData);
					}
					if (!closingFile && lineText.includes(endIndicator)) {
						closingFile = true;
						this.simpleIOPlugin.closeFile(fileId).then(() => {
							resolve(logCache);
						}).catch((err) => {
							this.$log.debug('this.cacheLog(): couldn\'t close file listener. ' + err);
							reject(err);
						});
					}
				});
			}
		});
	}

	// endregion

	/**
	 * Gets participant-data (summonername, played champion, team) From latest Game-log.
	 * Will also receive the champion and summonername of the active user explicitly as mySummonerName and myChampion
	 * @returns {*}
	 */
	/** @private */
	collectParticipantsData() {
		const regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/;
		let lines = [];

		let matchInfo = new MatchInfo();
		let stopLoop = false;
		return this.getGameLogCache()
			.then((gameLogCache) => {
				for (let i = 0; i < gameLogCache.length && !stopLoop; i++) {
					const lineData = gameLogCache[i];

					//region condition-checks
					const allParticipantsRead = (lines.length == 10 || i == gameLogCache.length - 1);
					if (allParticipantsRead) {
						this.$log.debug('Matchdata is ready');
						stopLoop = true; // break;

						return matchInfo
					}

					if (!lineData.includes("Spawning champion")) { // not a summoner-line
						continue; // return
					}
					//endregion

					//region logic
					const matches = regEx.exec(lineData);
					const line = new LineInfo();
					line.champion = matches[1];
					line.team = parseInt(matches[2]);
					line.clientId = parseInt(matches[3]);
					line.summoner = matches[4];
					lines.push(line);
					this.$log.debug("Found line for summoner: " + line.summoner);

					matchInfo['team_' + line.team].push({
						champion: line.champion,
						summoner: line.summoner,
						team: line.team
					});
					//endregion
				}
			});
	}

	/**
	 * Checks if the current summoner participates within the match.
	 * Assumes that the match is a replayClient match, otherwise the summoner
	 * is always within the match unless something went wrong with the logs or
	 * processing of it.
	 *
	 * @requires isReplayClient to be true
	 */
	/** @private */
	isUserReplay() { // TODO: testen
		let stopLoop = false;

		return this.getActiveSummoner().then((summoner) => {
			return this.getGameLogCache().then((gameLogCache) => {
				for (let i = 0; i < gameLogCache.length && !stopLoop; i++) {
					const lineData = gameLogCache[i];
					if (lineData.toLowerCase().includes(summoner)) {
						this.$log.debug('Summoner found in Match, it\'s a replay');
						stopLoop = true;
						return true
					}
				}
				if (!stopLoop) { // gameLogCache got searched through completely
					this.$log.debug('Summoner not found in Match, it\'s a spectate');
					return false
				}
			});
		});
	}

	/**
	 * Checks if the logged match is a replay or an actual game the user plays atm
	 */
	/** @private */
	isReplayClient() {
		return this.getGameLogCache().then((gameLogCache) => {
			for (let i = 0; i < gameLogCache.length; i++) {
				const lineData = gameLogCache[i];

				if (lineData.includes(this.GAME_LOG_REPLAY_INDICATOR)) {
					this.$log.debug('Match is in Replay Mode');
					return true
				} else if (lineData.includes(this.GAME_LOG_CHECK_FOR_REPLAY_END)) {
					this.$log.debug('Match is an actual game, no replay mode indicator found');
					return false
				}
			}
		});
	}

	/** @private */
	getLeagueClientSettingsCache() {
		if (this.logCache.leagueClientSettings) {
			return Promise.resolve(this.logCache.leagueClientSettings);
		} else {
			return this.getLeagueClientSettingsFilePath()
				.then((leagueClientSettingsFilePath) => {
					return this.simpleIOPlugin.waitForPlugin()
						.then(() => {
							// TODO: how to figure out when I need other encoding? For asian languages this might be neccessary to read files correctly
							return this.simpleIOPlugin.getTextFile(leagueClientSettingsFilePath, false)
								.then((data) => {
									this.$log.debug('loaded path: ', leagueClientSettingsFilePath, 'with' +
										' data', data);
									this.logCache.leagueClientSettings = data;
									return data
								})
								.catch((err) => {
									this.$log.debug(err);
									throw err
								});
						})
				})
		}
	}
}