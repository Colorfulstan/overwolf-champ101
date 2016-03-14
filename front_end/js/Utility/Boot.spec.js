import Boot from 'Boot'
import WindowCtrl from 'WindowCtrl'

describe("Boot.js || ", function () {
	describe("strap() || ", function () {
		beforeEach(function () {
			spyOn(Boot, 'checkIfGameIsRunning');
			Boot.checkIfGameIsRunning.and.returnValue($.Deferred().resolve().promise());

			spyOn(Boot, 'launchApp');
		});
		it("should call checkIfGameIsRunning and launchApp", function () {
			var isFirstAppStart = 'boolean';
			var settings = {};
			var main = {name: 'main'};
			Boot.strap(main, settings, isFirstAppStart);
			expect(Boot.checkIfGameIsRunning).toHaveBeenCalled();
			expect(Boot.launchApp).toHaveBeenCalledWith(main, settings, isFirstAppStart);
		});
	});
	describe("checkIfGameIsRunning() || ", function () {
		var mock_getRunningGameInfo_inGame, mock_getRunningGameInfo_notInGame, spy_isGameRunningSetter;
		var mock_GameInfo = {property: 'value'};
		beforeEach(function () {
			mock_getRunningGameInfo_inGame = jasmine.createSpy('getRunningGameInfo_inGame');
			mock_getRunningGameInfo_inGame.and.callFake(function (cb) { cb(mock_GameInfo);});

			mock_getRunningGameInfo_notInGame = jasmine.createSpy('getRunningGameInfo_notInGame');
			mock_getRunningGameInfo_notInGame.and.callFake(function (cb) { cb(null);});

			spy_isGameRunningSetter = jasmine.createSpy('settings.isGameRunning()');
		});
		it("should resolve to true if in a game", function () {
			Boot.checkIfGameIsRunning(mock_getRunningGameInfo_inGame, spy_isGameRunningSetter)
				.then(function (value) { expect(value).toBe(true); });
		});
		it("should set isGameRunning to true if in a game", function () {
			Boot.checkIfGameIsRunning(mock_getRunningGameInfo_inGame, spy_isGameRunningSetter);
			expect(spy_isGameRunningSetter).toHaveBeenCalledWith(true);
		});
		it("should resolve to false if not in a game", function () {
			Boot.checkIfGameIsRunning(mock_getRunningGameInfo_notInGame, spy_isGameRunningSetter)
				.then(function (value) { expect(value).toBe(false); });
		});
		it("should set isGameRunning to false if not in a game", function () {
			Boot.checkIfGameIsRunning(mock_getRunningGameInfo_notInGame, spy_isGameRunningSetter);
			expect(spy_isGameRunningSetter).toHaveBeenCalledWith(false);
		});
	});
	describe("askForSummoner() || ", function () {
		var mock_isSummonerSetGetter;
		beforeEach(function () {
			WindowCtrl.openSettings = jasmine.createSpy('openSettings Stup');
			mock_isSummonerSetGetter = jasmine.createSpy('isSummonerSetGetter');
		});
		describe("after settingsClosed Event is triggered", function () {
			it("should resolve the promise if summoner is set", function () {
				mock_isSummonerSetGetter.and.returnValue(true);

				var p = Boot.askForSummoner(mock_isSummonerSetGetter);
				p.always(function () {
						expect(p.state()).toBe('resolved');
					}
				);
				WindowCtrl.events.trigger('settingsClosed');
			});
			it("should reject the promise if no summoner is set", function () {
				mock_isSummonerSetGetter.and.returnValue(false);
				var p = Boot.askForSummoner(mock_isSummonerSetGetter);
				p.always(function () {
							expect(p.state()).toBe('rejected')
						}
				);
				WindowCtrl.events.trigger('settingsClosed');
			});

			it("should only listen for settingsClosed once", function () {
				Boot.askForSummoner(mock_isSummonerSetGetter);

				WindowCtrl.events.trigger('settingsClosed');
				expect(mock_isSummonerSetGetter).toHaveBeenCalled();
				WindowCtrl.events.trigger('settingsClosed');
				expect(mock_isSummonerSetGetter.calls.count()).toBe(1);
			});
		});
	});
});