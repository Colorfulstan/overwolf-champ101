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
		this.containsMyself = containsMyself || false
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
		this.GAME_LOG_5v5_SPAWNING_DONE_MARK = 'GAMESTATE_GAMELOOP Begin' // both in replay and live safe way // works in 3v3 custom game
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
		this.installPath = null

		/** @private */
		this.leagueClientSettingsFilePath = null
		// needs to be chained after a method to check if in game and get the gameroot
		/** @private */
		this.region = null
		/** @private */
		this.matchStartTime = null
		/** @private */
		this.gameLogFilePath = null

		this.championsInTeamPromise = null

		this.isGarena = null

	}

	gettingInstallPath() { // add to LB implementation
		if (this.installPath) {
			this.$log.info('InstallPath already set: ' + this.installPath)
			return Promise.resolve(this.installPath)
		}
		return this.gettingGameInfo(5426) // TODO: constant for League game
			.then(gameInfo => {
				const launcherPath = gameInfo.LauncherPath
				this.$log.debug('launcherpath: ' + launcherPath)
				this.installPath = launcherPath.substring(0, launcherPath.lastIndexOf('/') + 1)
				this.$log.debug("OwIoLolService.gettingInstallPath(): InstallPath loaded. " + this.installPath)
				return this.installPath
			})
			.catch(newErr => {
				return Promise.reject(new Error(newErr.toString() + ' -> ' + newErr.toString()))
			})
	}

	getGameRoot() {
		if (this.gameRoot) {
			this.$log.info('Gameroot already set: ' + this.gameRoot)
			return Promise.resolve(this.gameRoot)
		} else {
			return this.gettingInstallPath()
				.then((installPath) => {
					return this.gettingGameRootFromInstallPath(installPath)
						.then((gameRoot) => {
							this.gameRoot = gameRoot
							this.$log.debug("OwIoLolService.getGameRoot(): GameRoot loaded. " + this.gameRoot)
							return Promise.resolve(gameRoot)
						})
						.catch((err) => {
							this.gameRoot = null
							const errMsg = err.toString() + " -> Could not find GameRoot - Neither RIOT nor Garena Client could be identified with certainty"
							return Promise.reject(new Error(errMsg))
						})
				})
				.catch((err) => {
					const errMsg = err.toString() + '-> unexpected Error while trying to get GameRoot'
					this.$log.debug(errMsg)
					return Promise.reject(new Error(errMsg))
				})
		}
	}

	gettingRunningGameInfo() { // TODO: move into OwGamesService
		return new Promise((resolveRunningGameInfo, rejectRunningGameInfo) => {
			this.owSdk.games.getRunningGameInfo((gameInfo) => {
				if (gameInfo == null || !gameInfo.id || Math.floor(gameInfo.id / 10) !== 5426) {
					this.$log.debug("OwIoLolService.getGameRoot(): Not in game.")
					rejectRunningGameInfo(new Error(this.MSG_NOT_IN_GAME))
				} else {
					resolveRunningGameInfo(gameInfo)
				}
			})
		})
	}

	gettingGameInfo(gameId) { // TODO: move into OwGamesService
		return new Promise((resolveGameInfo, rejectGameInfo) => {
			this.$log.info('Trying to get GameInfo')

			this.owSdk.games.getGameInfo(gameId, (result) => {
				this.$log.debug('got GameInfo' + JSON.stringify(result.gameInfo))
				if (result.status === 'success' && result.gameInfo && result.gameInfo.LauncherPath) {
					resolveGameInfo(result.gameInfo)
				} else {
					rejectGameInfo(new Error('Could not resolve League gamePath from getGameInfo ID 5426'))
				}
			})
		})
	}

	/** @private */
	gettingGameRootFromInstallPath(installPath) {
		// check if Garena client by looking for the GameData folder in installPath (only available on Garena)

		return this.checkingIfIsGarena()
			.then(isGarena => {
				if (isGarena) {
					const pathPart1 = installPath + 'GameData/Apps/'
					return this.simpleIOPlugin.listDirectory(pathPart1).then(listing => {
						return pathPart1 + listing[0].name + '/'
					})

				}
				else {return installPath}
			})
	}

	/** @private */
	getConfigPath() {
		return this.checkingIfIsGarena().then(isGarena => {
			return this.getGameRoot().then(gameroot => {
				const configPath = isGarena ? gameroot + 'LeagueClient/Config/' : gameroot + 'Config/'
				this.$log.debug('got configPath: ' + configPath)
				return configPath
			})
		})
	}

	/** @private */
	getLeagueClientSettingsFilePath() {
		if (this.leagueClientSettingsFilePath) {
			return Promise.resolve(this.leagueClientSettingsFilePath)
		} else {
			return this.getConfigPath().then((configPath) => {
				this.leagueClientSettingsFilePath = configPath + 'LeagueClientSettings.yaml'
				return this.leagueClientSettingsFilePath
			}).catch((errMsg) => {
					this.$log.debug(errMsg)
					this.leagueClientSettingsFilePath = null
					return Promise.reject(errMsg)
				}
			)
		}
	}


	// endregion

	// region Information

	// /**
	//  *
	//  * known issue:
	//  * if multiple users use this computer, this method might return the wrong summoner
	//  * If the summoner logs in the first time, the right summoner will be choosen.
	//  * If the summoner did not change since the last played game on this computer, the right name will be choosen.
	//  *
	//  * However, if the summoner changed since the last played game and the now logged in summoner
	//  * already played on this computer before, the wrong summoner will be choosen!
	//  *
	//  * TODO: implement workaround to minimize error-quote on this issue
	//  * A possible workaround would be to CHECK IF THERE ARE MORE THEN 2 FILES (excluding folders)
	//  * present within the directory. IF NOT, THEN THE LATEST FILE WILL BE GOOD ENOUGH.
	//  * If there are more then 2 files however, then GET ALL SUMMONERNAMES PRESENT
	//  * AND RETURN THEM AS ARRAY representing "known-summoners".
	//  * So the APPLICATION HAS TO CHECK IF AN ARRAY OR A STRING IS RETURNED.
	//  * If an array is returned and there is no active game for the summoner, try the next one.
	//  * (build array in order of last modification of the file)
	//  * If all of them are not found within a match, use gamelog for getting the summonername.
	//  * @returns {*}
	//  * @deprecated
	//  */
	// getActiveSummoner() {
	// 	this.$log.debug('getting active summoner')
	//
	// 	let foundSummonerName = false
	//
	// 	return this.getActiveRegion()
	// 		.then((region) => {
	// 			return this.getPreferencesPath(region === 'garena')
	// 		})
	// 		.then((path) => this.simpleIOPlugin.getLatestFileInDirectory(path))
	// 		.then((filename) => {
	// 			if (!filename.endsWith(".properties")) {
	// 				const errMsg = "Couldn't find summoner name from file."
	// 				this.$log.debug(errMsg)
	// 				throw new Error(errMsg)
	// 			}
	// 			if (filename.startsWith("shared_")) {
	// 				filename = filename.substring("shared_".length)
	// 			}
	// 			filename = filename.substring(0, filename.indexOf("."))
	//
	// 			const mySummoner = filename
	// 			this.$log.debug("My summoner (lowercase): " + mySummoner)
	// 			return mySummoner
	// 		})
	// 		.catch((err) => {
	// 			this.$log.debug('OwIoLolService.getActiveSummoner():' + err)
	// 			throw err
	// 		})
	// }

	checkingIfIsGarena() {

		if (this.isGarena !== null) {
			return Promise.resolve(this.isGarena)
		} else {
			// check if Garena client by looking for the GameData folder in installPath (only available on Garena)
			return this.gettingInstallPath()
				.then((installPath) => {
					return this.simpleIOPlugin.checkingIfDirectoryExists(installPath + 'GameData')
						.then(isGarena => {
							this.$log.info('Garena Client detected: ' + isGarena)
							this.isGarena = isGarena
							return isGarena
						})
				})
		}
	}

	/**
	 * Returns the RegionTag of the active player.
	 * Returns 'garena' if players is on servers not supported by the RIOT API.
	 * can only used when within a game
	 * @returns {Promise|string} the regionTag for the current Player (Summoner)
	 */
	getActiveRegion() {
		this.$log.debug('getting active region')
		if (this.region) {
			this.$log.debug('region already set: ' + this.region)
			return Promise.resolve(this.region)
		} else {
			return this.checkingIfIsGarena().then((isGarena) => {
				if (isGarena) {
					this.region = 'garena'
					return this.region
				} else {
					this.$log.debug('client is not garena')
					return this.getLeagueClientSettingsCache().then((data) => {
						// TODO: are LAS / LAN Regions right in this approach? (see below for
						// clientpropertiescache
						const regex = /region: "(.*)"/
						return [data, regex]
					}).then(([data, regex]) => {
						let region

						const matches = regex.exec(data)

						if (matches) {
							region = matches[1]
						} else {
							region = 'garena' // garena doesn't have regionTag or platformId line
						}
						this.$log.debug('region found: ' + region)
						return region
					})
				}
			})
				.catch((err) => {
					if (err.toString() === this.MSG_NOT_IN_GAME) {
						this.$log.debug("No Running Game - can't determine region")
						this.region = 'undefined'
						return this.region
					} else {
						throw err
					}
				})
		}
	}

	//
	// getMatchInfo(activeSummonerOrNull) {
	// 	const mySummoner = activeSummonerOrNull
	// 	this.$log.debug('OwIoLolService.getMatchInfo(): Summoner given: ' + mySummoner)
	// 	this.$log.debug('getting match info')
	//
	// 	let result = new Result()
	// 	result.status = "error"
	//
	// 	return this.collectParticipantsData()
	// 		.then((matchInfo) => { // get data in relation to summoner
	//
	// 			if (mySummoner) {
	// 				// interpretate matchdata in relation to active user
	// 				let foundMySummoner = false
	//
	// 				const teamKeysArr = Object.keys(matchInfo).filter((key) => key.indexOf('team_') !== -1)
	//
	// 				for (let i = 0; i < teamKeysArr.length; i++) {
	// 					const teamKey = teamKeysArr[i]
	// 					const team = matchInfo[teamKey]
	// 					for (let j = 0; j < team.length; j++) {
	// 						const summoner = team[j].summoner
	// 						const champion = team[j].champion
	//
	// 						if (summoner.toLowerCase() === mySummoner.toLowerCase()) {
	// 							foundMySummoner = true
	// 							matchInfo.myChampion = champion
	// 							this.$log.debug("OwIoLolService: my Champion: " + matchInfo.myChampion)
	//
	// 							matchInfo.mySummonerName = summoner
	// 							this.$log.debug("OwIoLolService: my Summoner: " + matchInfo.mySummonerName)
	//
	// 							matchInfo.enemyTeamKey = summoner
	// 							this.$log.debug("OwIoLolService: my Summoner: " + matchInfo.mySummonerName)
	//
	// 							matchInfo.alliedTeamKey = teamKey
	// 							this.$log.debug("OwIoLolService: alliedTeamKey: " + matchInfo.alliedTeamKey)
	//
	// 							matchInfo.enemyTeamKey = (i === 1) ? teamKeysArr[0] : teamKeysArr[1]
	// 							this.$log.debug("OwIoLolService: enemyTeamKey: " + matchInfo.enemyTeamKey)
	// 						}
	// 					}
	// 				}
	//
	// 				if (foundMySummoner) {
	// 					matchInfo.containsMyself = true
	// 					this.$log.debug("User is present in this game (playing or replay)", matchInfo)
	// 				} else {
	// 					matchInfo.containsMyself = false // spectating someone
	// 					this.$log.debug("User is spectating someone else", matchInfo)
	// 				}
	// 			}
	// 			return matchInfo
	// 		})
	// 		.then((matchInfo) => {
	// 			result.status = "success"
	// 			result.errorMessage = null
	// 			result.matchInfo = matchInfo
	// 			this.$log.debug("OwIoLolService.getMatchInfo(): success: ", matchInfo)
	// 			return result
	// 		})
	// 		.catch((err) => {
	// 			result.errorMessage = err.toString()
	// 			this.$log.debug(err)
	// 			throw err
	// 		})
	// }

	/**
	 * Contains sideeffects!
	 * @returns {Promise} resolves to true when OwIoLolService is ready
	 */
	/** @private
	 * @deprecated listen to log directly, since it will not be written "live" but in chunks*/
	getGameLogCache() {
		return this.simpleIOPlugin.refreshingPlugin()
			.then(() => this.getGameLogFilePath())
			.then((gameLogPath) => {
				return this.simpleIOPlugin.waitForPlugin()
					.then(() => this.cacheLog('game', gameLogPath, this.GAME_LOG_5v5_SPAWNING_DONE_MARK))
			})
	}


	/** @private */
	getGameLogFilePath() {
		if (this.gameLogFilePath) {
			this.$log.debug('using cached gameLogFilePath: ', this.gameLogFilePath)
			return Promise.resolve(this.gameLogFilePath)
		} else {
			this.$log.debug('getting gameLogFilePath from files')
			const path = 'Logs/GameLogs/'
			return Promise.all([this.getGameRoot(), this.checkingIfIsGarena()])
				.then(([gameRoot, isGarena]) => {
					const logPath = gameRoot + (isGarena ? 'Game/' : '') + path
					return this.simpleIOPlugin.listDirectory(logPath)
						.then(dirListing => {
							return this.simpleIOPlugin.getLatestFileInDirectory(logPath + dirListing[dirListing.length - 1].name + '/', 'r3dlog', true)
						})
				})
				.then((filepath) => {
					this.gameLogFilePath = filepath
					return this.gameLogFilePath
				})
				.catch((err) => {
					const message = 'getGameLogFilePath failed -> ' + err.toString()
					this.$log.debug(message)
					throw new Error(message)
				})
		}
	}
	/** @private */
	cacheLog(type, path, endIndicator) {
		this.$log.debug('starting to cache game-log ' + type + ' ' + path + ' ' + endIndicator)
		return new Promise((resolve, reject) => { // TODO: make this a stream (rxjs)
			const fileId = type + 'Log'
			const logCache = this.logCache[type]
			let closingFile = false

			if (logCache.length > 0) {
				this.$log.debug('OwIoLolService: finished caching game-log (using cached)')
				resolve(logCache) // gets cleaned up when a new match begins (the app restarts), otherwise some cache validation would be neccessary
			} else {
				let skipToEndOfFile = false

				this.simpleIOPlugin.listenOnFile(fileId, path, skipToEndOfFile, (id, status, lineData) => {
					if (closingFile) {
						return
					}
					if (id != fileId || !status) {
						closingFile = true
						this.simpleIOPlugin.closeFile(fileId).catch(() => true).then(() => reject("Couldn't find info" +
							" from file."))
						return
					}

					const l = logCache.length
					const lineText = lineData.substring(lineData.lastIndexOf('|') + 1) // if no | is found, index will be 0
					if (logCache[l - 1] !== lineText) {
						logCache.push(lineData)
					}
					if (!closingFile && lineText.includes(endIndicator)) {
						closingFile = true
						this.simpleIOPlugin.closeFile(fileId).then(() => {
							resolve(logCache)
						}).catch((err) => {
							this.$log.debug('this.cacheLog(): couldn\'t close file listener. ' + err)
							reject(err)
						})
					}
				})
			}
		})
	}

	// endregion

	/**
	 * Gets participant-data (summonername, played champion, team) From latest Game-log.
	 * Will also receive the champion and summonername of the active user explicitly as mySummonerName and myChampion
	 * @returns {*}
	 */
	/** @private
	 * @deprecated*/
	collectParticipantsData() {
		const regEx = /[0-9.| a-zA-Z]*[()]([\w]+)[) ]\ with skinID [\d]+ on team ([\d]+) for clientID ([-]*[\d]) and summonername [(]([^)]+)\)/
		let lines = []

		let matchInfo = new MatchInfo()
		let stopLoop = false
		return this.getGameLogCache()
			.then((gameLogCache) => {
				for (let i = 0; i < gameLogCache.length && !stopLoop; i++) {
					const lineData = gameLogCache[i]

					//region condition-checks
					const allParticipantsRead = (lines.length == 10 || i == gameLogCache.length - 1)
					if (allParticipantsRead) {
						this.$log.debug('Matchdata is ready')
						stopLoop = true // break;

						return matchInfo
					}

					if (!lineData.includes("Spawning champion")) { // not a summoner-line
						continue // return
					}
					//endregion

					//region logic
					const matches = regEx.exec(lineData)
					const line = new LineInfo()
					line.champion = matches[1]
					line.team = parseInt(matches[2])
					line.clientId = parseInt(matches[3])
					line.summoner = matches[4]
					lines.push(line)
					this.$log.debug("Found line for summoner: " + line.summoner)

					matchInfo['team_' + line.team].push({
						champion: line.champion,
						summoner: line.summoner,
						team: line.team
					})
					//endregion
				}
			})
	}

	gettingChampionsInTeams() {
		this.$log.debug('gettingChampionsInTeams')
		if (this.championsInTeamPromise) {
			this.$log.debug('Already aggregating champions, returning promise')
			return this.championsInTeamPromise
		}

		const START_INDICATOR = "Game Info Start"
		const END_INDICATOR = "Game Info End"
		const TEAM_ORDER = 100
		const TEAM_CHAOS = 200
		const REGEXP = /\D\| (.*?) Skin (.*?) \((\w.*?) (\w.*?)\)/
		const id = 'gameLogForChampionsInTeams'

		let teams = {
			['team_' + TEAM_ORDER]: [],
			['team_' + TEAM_CHAOS]: []
		}
		let inGameSectionStarted = false
		let inGameSectionEnded = false
		return this.championsInTeamPromise = new Promise((resolve, reject) => {
			this.getGameLogFilePath().then(path => {
				this.$log.debug('path to game-log:', path)
				this.simpleIOPlugin.listenOnFile(id, path, false, (fileId, status, line) => {
					if (fileId === id) {
						if (line.indexOf(END_INDICATOR) !== -1) {
							inGameSectionEnded = true
							this.simpleIOPlugin.closeFile(id)
							this.$log.debug('gettingChampionsInTeams reached end:', teams)
							resolve(teams)
							return
						}
						if (!inGameSectionStarted) {
							inGameSectionStarted = line.indexOf(START_INDICATOR) !== -1
						}
						if (inGameSectionStarted && !inGameSectionEnded) {
							console.log('isInGameInfoSection' + line)
							let matches = REGEXP.exec(line)
							if (matches) {

								const skinId = matches[2]
								// 100 or 200
								const teamId = (matches[3] === 'Order') ? TEAM_ORDER : TEAM_CHAOS
								const isBot = matches[4] === 'Bot'

								// if the match includes bot the regex will get something like "Cassiopeia bot" as champion
								let champion = isBot ? matches[1].replace(' bot', '') : matches[1]
								if (champion.toLowerCase() === 'fiddlesticks'){
									champion = 'Fiddlesticks' // still wrong in game logs
								}

								teams['team_' + teamId].push({
									champion: champion,
									team: teamId,
									isBot,
									skinId
								})
							}
						}
					}
				})

			})
		})
	}


	/** @private */
	getLeagueClientSettingsCache() {
		if (this.logCache.leagueClientSettings) {
			return Promise.resolve(this.logCache.leagueClientSettings)
		} else {
			return this.getLeagueClientSettingsFilePath()
				.then((leagueClientSettingsFilePath) => {
					return this.simpleIOPlugin.waitForPlugin()
						.then(() => {
							// TODO: how to figure out when I need other encoding? For asian languages this might be neccessary to read files correctly
							return this.simpleIOPlugin.getTextFile(leagueClientSettingsFilePath, false)
								.then((data) => {
									this.$log.debug('loaded path: ', leagueClientSettingsFilePath, 'with' +
										' data', data)
									this.logCache.leagueClientSettings = data
									return data
								})
								.catch((err) => {
									this.$log.debug(err)
									throw err
								})
						})
				})
		}
	}
}