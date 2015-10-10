window.overwolf = {
	windows: {
		dragResize: jasmine.createSpy('overwolf.window.dragResize spy'),
		dragMove: jasmine.createSpy('overwolf.window.dragMove spy'),
		minimize: jasmine.createSpy('overwolf.window.minimize spy'),
		obtainDeclaredWindow: jasmine.createSpy('overwolf.window.obtainDeclaredWindow spy'),
		restore: jasmine.createSpy('overwolf.window.restore spy'),
		changePosition: jasmine.createSpy('overwolf.window.changePosition spy'),
		close: jasmine.createSpy('overwolf.window.close spy'),
		onStateChanged: {
			addListener: jasmine.createSpy('overwolf.windows.onStateChanged.addListener spy'),
			removeListener: jasmine.createSpy('overwolf.windows.onStateChanged.removeListener spy')
		},
		onMainWindowRestored: {
			addListener: jasmine.createSpy('overwolf.windows.onMainWindowRestored.addListener spy'),
			removeListener: jasmine.createSpy('overwolf.windows.onMainWindowRestored.removeListener spy')
		}
	},
	games: {
		//overwolf.games.getRunningGameInfo(function (/** GameInfo */ data) {});
		getRunningGameInfo: jasmine.createSpy('overwolf.games.getRunningGameInfo spy'),
			//overwolf.games.onGameInfoUpdated.addListener(function (/** GameInfoChangeData */ result) {});
		onGameInfoUpdated: {
			addListener: jasmine.createSpy('overwolf.games.onGameInfoUpdated.addListener spy'),
			removeListener: jasmine.createSpy('overwolf.games.onGameInfoUpdated.removeListener spy')
		},
		onGameLaunched: {
			addListener: jasmine.createSpy('overwolf.games.onGameLaunched.addListener spy'),
			removeListener: jasmine.createSpy('overwolf.games.onGameLaunched.removeListener spy')
		},
		onMajorFrameRateChange: {
			addListener: jasmine.createSpy('overwolf.games.onMajorFrameRateChange.addListener spy'),
			removeListener: jasmine.createSpy('overwolf.games.onMajorFrameRateChange.removeListener spy')
		},
		inputTracking: {
			onMouseUp : {
				addListener : jasmine.createSpy('overwolf.games.inputTracking.onMouseUp.addListener spy'),
				removeListener : jasmine.createSpy('overwolf.games.inputTracking.onMouseUp.removeListener spy'),
			}
		},
		events : {
			onError: {
				addListener : jasmine.createSpy('overwolf.games.events.onError.addListener spy'),
				removeListener : jasmine.createSpy('overwolf.games.events.onError.removeListener spy')
			},
			onInfoUpdates: {
				addListener : jasmine.createSpy('overwolf.games.events.onInfoUpdates.addListener spy'),
				removeListener : jasmine.createSpy('overwolf.games.events.onInfoUpdates.removeListener spy')
			},
			onNewEvents: {
				addListener : jasmine.createSpy('overwolf.games.events.onNewEvents.addListener spy'),
				removeListener : jasmine.createSpy('overwolf.games.events.onNewEvents.removeListener spy')
			}
		}

	}

};

