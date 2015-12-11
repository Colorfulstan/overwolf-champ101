import MainCtrl from 'MainCtrl';
import SettingsModel from 'SettingsModel';
import 'js/boot';

xdescribe("mainSpec.js - including dependencies from boot.js", function () {
	it("Test-Dependencies are defined", function () {
		expect(window.MainCtrl).toBeDefined('MainCtrl');
		expect(window.Routes).toBeDefined('Routes');
		expect(window.SettingsModel).toBeDefined('SettingsModel');
	});
});
//describe("ingame start", function () {
//	beforeEach(function () {
//		var mockGetRunningGameInfo = function (cb) {
//			cb({});
//		};
//		overwolf.games.getRunningGameInfo.and.callFake(mockGetRunningGameInfo);
//	});
//	it("should set isInGame to true", function () {
//		expect(SettingsModel.isInGame()).toBe(true);
//	});
//});
//describe("outofgameStart start", function () {
//	beforeEach(function () {
//		var mockGetRunningGameInfo = function (cb) {
//			cb(undefined);
//		};
//		overwolf.games.getRunningGameInfo.and.callFake(mockGetRunningGameInfo);
//	});
//	it("should set isInGame to false", function () {
//		expect(SettingsModel.isInGame()).toBe(false);
//	});
//});