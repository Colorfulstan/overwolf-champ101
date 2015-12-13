import Boot from 'Boot'

describe("Boot.js || ", function () {
	describe("strap() || ", function () {
		beforeEach(function () {
			spyOn(Boot, 'checkIfIngame');
			Boot.checkIfIngame.and.returnValue($.Deferred().resolve().promise());

			spyOn(Boot, 'launchApp');
		});
		it("should call checkIfIngame and launchApp", function () {
			var isFirstAppStart = 'boolean';
			var settings = {};
			Boot.strap(isFirstAppStart, settings);
			expect(Boot.checkIfIngame).toHaveBeenCalled();
			expect(Boot.launchApp).toHaveBeenCalledWith(settings, isFirstAppStart);
		});
	});
	describe("checkIfIngame() || ", function () {
		var mock_getRunningGameInfo_inGame, mock_getRunningGameInfo_notInGame, spy_isInGameSetter;
		var mock_GameInfo = {property: 'value'};
		beforeEach(function () {
			mock_getRunningGameInfo_inGame = jasmine.createSpy('getRunningGameInfo_inGame');
			mock_getRunningGameInfo_inGame.and.callFake(function (cb) { cb(mock_GameInfo);});

			mock_getRunningGameInfo_notInGame = jasmine.createSpy('getRunningGameInfo_notInGame');
			mock_getRunningGameInfo_notInGame.and.callFake(function (cb) { cb(null);});

			spy_isInGameSetter = jasmine.createSpy('settings.isInGame()');
		});
		it("should resolve to true if in a game", function () {
			Boot.checkIfIngame(mock_getRunningGameInfo_inGame, spy_isInGameSetter)
				.then(function (value) { expect(value).toBe(true); });
		});
		it("should set isInGame to true if in a game", function () {
			Boot.checkIfIngame(mock_getRunningGameInfo_inGame, spy_isInGameSetter);
			expect(spy_isInGameSetter).toHaveBeenCalledWith(true);
		});
		it("should resolve to false if not in a game", function () {
			Boot.checkIfIngame(mock_getRunningGameInfo_notInGame, spy_isInGameSetter)
					.then(function (value) { expect(value).toBe(false); });
		});
		it("should set isInGame to false if not in a game", function () {
			Boot.checkIfIngame(mock_getRunningGameInfo_notInGame, spy_isInGameSetter)
			expect(spy_isInGameSetter).toHaveBeenCalledWith(false);
		});
	});
});