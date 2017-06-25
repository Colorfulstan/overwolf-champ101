import {OverwolfPlugin} from 'overwolfplugin'

/** To use this class, simpleIOPlugin needs to be set within manifest.json and files need to be added */
export class OwSimpleIOPluginService {


	/**:ODKSimpleIOPlugin TODO: typing */

	constructor($log) {
		// migrating steal.dev.log / .warn
		// this.$log = {
		//     log: $log.log,
		//     debug: $log.log,
		// info: $log.log,
		// error: $log.warn,
		//     warn: $log.warn
		// }
		this.$log = $log


		/**@private*/
		this.PLUGIN_CHECK_READY_INTERVAL_MS = 50
		/**@private*/
		this.PLUGIN_TIMEOUT_MS = 10000

		/** indicator if plugin currently is processing something where no other API calls can be made (listenOnFile for time being)
		 * gets set to true when calling listenToFile() and set to false when calling closeFile().*/
		this.isInUse = false
		this.pluginId = 'simple-io-plugin'

		/** @private */
		this.plugin = this.addingPlugin(this.pluginId).then(plugin => this.plugin = plugin)
	}

	refreshingPlugin() {
		return this.addingPlugin(this.pluginId).then(plugin => this.plugin = plugin)
	}

	addingPlugin(extraObjectNameInManifest) {
		const plugin = new OverwolfPlugin(extraObjectNameInManifest, true)
		return new Promise((resolve, reject) => {
			plugin.initialize(function (status) {
				if (status == false) {
					reject(new Error('simple-io-plugin could not be initialised'))
				} else {
					resolve(plugin)
				}
			})
		})
	}

	/**
	 * resolves when the plugin is not used anymore.
	 * rejected after the given timeout.
	 * Should be chained before any other method to ensure availability
	 */
	waitForPlugin(intervallMs = this.PLUGIN_CHECK_READY_INTERVAL_MS, timeoutMs = this.PLUGIN_TIMEOUT_MS) {
		return new Promise((resolve, reject) => {
			let passedTimeMs = 0
			const ival = setInterval(() => {
				if (passedTimeMs > timeoutMs) {
					reject(new Error(`simpleIOPlugin.waitForPlugin() timed out after ${passedTimeMs} MS`)) // TODO:
					// OwIoError
					clearInterval(ival)
				} else if (!this.isInUse) {
					clearInterval(ival)
					resolve(true)
				}
				passedTimeMs += intervallMs
			}, intervallMs)
		})
	}

	getPlugin() {
		return this.plugin.get()
	};

	/**
	 * @param {string} dir directory-path with trailing slash (e.g. path/to/something/ )
	 * @param searchTerm limits possible result to only the filenames containing the searchTerm somewhere in its name
	 * @param {boolean} receiveFullPath if falsy only the filenam with extension ( someName.ext) will be returned. <br>
	 *     Otherwise the full filepath and name will be returned (c://path/to/file.ext)
	 * @returns {Promise | string} Promise that resolves to the name or path of the last modified file
	 */
	getLatestFileInDirectory(dir, searchTerm = null, receiveFullPath = false) {
		return new Promise((resolve, reject) => {
			searchTerm = searchTerm ? '*' + searchTerm + '*' : '*'
			try {
				this.getPlugin().getLatestFileInDirectory(dir + searchTerm, (status, filename) => {
					if (!status) {
						reject(new Error('Unable to open any file for path ' + dir + searchTerm)) // TODO: OwIoError
					}
					receiveFullPath ? resolve(dir + filename) : resolve(filename)
				})
			} catch (e) {
				reject(new Error('Unable to open any file for path ' + dir + searchTerm)) // TODO: OwIoError
			}
		})
	}

	listenOnFile(fileId, path, bool, callback) {
		this.isInUse = true
		// TODO: how to remove the listener again on stopListen?
		this.getPlugin().onFileListenerChanged.addListener(callback)
		this.getPlugin().listenOnFile(fileId, path, bool, (id, status) => {
			if (!status) {
				this.getPlugin().onFileListenerChanged.removeListener(callback)
				callback(id, false)
			}
		})
	}

	listDirectory(path) {
		return new Promise((resolve, reject) => {
			try {
				this.getPlugin().listDirectory(path, (status, listing) => {
					console.error(path, status, listing)
					if (typeof listing == 'string') {
						listing = JSON.parse(listing)
					}
					resolve(listing)
				})
			} catch (e) {
				reject(e)
			}
		})
	}

	getTextFile(path, isUCS2) {
		return new Promise((resolve, reject) => {
			try {
				this.getPlugin().getTextFile(path, isUCS2, (status, data) => {
					if (!status) {
						reject(new Error('simpleIOPlugin failed to load Text from: ' + path)) // TODO: OwIoError
					} else {
						resolve(data)
					}
				})
			} catch (e) {
				reject(new Error('simpleIOPlugin failed to load Text from: ' + path + '' + e.message)) // TODO: OwIoError
			}
		})
	}

	closeFile(fileId) { // TODO: refactor to private
		return new Promise((resolve, reject) => {
			this.$log.debug('Closing file ' + fileId + ' in 2000 MS...')
			setTimeout(() => {
				try {
					this.getPlugin().stopFileListen(fileId)
					this.$log.debug('File listener closed.')
				} catch (e) {
					//this.getPlugin().stopFileListen(fileId);
					this.$log.warn('Error closing File listener for fileId: ' + fileId, e)
				} finally {
					this.$log.warn('closeFile() moving on regardless...')
					this.isInUse = false
					resolve(true)
				}
			}, 2000) // timing is crucial! Too little time and there will be an error trying to calling stopFileListen() - 2 seconds seem to be a safe amount
		})
	}

	checkingIfDirectoryExists(path) { // TODO: add to LB implementation
		return new Promise((resolve, reject) => {
			try {
				this.getPlugin().isDirectory(path, (status) => {
					resolve(status)
				})
			} catch (e){
				reject(e)
			}
		})
	}
}
