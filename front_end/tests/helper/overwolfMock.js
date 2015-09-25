window.overwolf = {
	windows: {
		//	windows.dragResize(name, edge);
		//windows.dragMove(name);
		//windows.minimize(name);
		//windows.obtainDeclaredWindow(name, function (result) {});
		//windows.restore(odkWindow.id, function (result) {});
		//windows.changePosition(odkWindow.id, x, y);
		//windows.close(odkWindow.id, function (/** ODKWindow */ result) {});
		//overwolf.windows.onStateChanged.addListener(function (/** WindowStateChangeData */ result) {});
		//overwolf.windows.onMainWindowRestored.addListener(function (/** null */ result) {});

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
		}

	}

};

