import SettingsModel from "SettingsModel"
import analytics from '../helper/analyticsMock';

import SettingsCtrl from "SettingsCtrl"

describe("SettingsCtrlSpec - testing the Settings-Window ", function () {
	var settingsCtrl, settingsModel;
	beforeEach(function () {
		settingsModel = new SettingsModel();
		settingsCtrl = new SettingsCtrl('html', {settings: settingsModel});
	});
	afterEach(function () {
		if (settingsCtrl.destroy !== 'undefined') {
			settingsCtrl.destroy();
		}
	});
	xdescribe("summonerUnchanged ", function () {
		function createTrueCondition(settingsCtrl) {
			spyOn(SettingsModel, 'isSummonerSet').and.returnValue(true);
			var settings = settingsCtrl.options.settings;

			settings.summonerName('Not ---');
			delete settings.changedPropsOriginalValues.summonerName;
		}

		beforeEach(function () {
			createTrueCondition(settingsCtrl);
		});
		it("should return true when using createTruCondition Test-Helper Method", function () {
			expect(settingsCtrl.summonerUnchanged()).toBe(true);
		});
		it("should return false when username is set to ---", function () {
			settingsCtrl.options.settings.summonerName('---');
			expect(settingsCtrl.summonerUnchanged()).toBe(false);
		});
		it("should return false when server changed", function () {
			settingsCtrl.options.settings.server('na');
			expect(settingsCtrl.summonerUnchanged()).toBe(false);
		});
		it("should return false when summonerName changed", function () {
			settingsCtrl.options.settings.summonerName('123');
			expect(settingsCtrl.summonerUnchanged()).toBe(false);
		});
	});
	describe("reset ", function () {
		it("should restore the original settings if something changed", function () {
			settingsModel.server('euw');
			var newSettingsModel = new SettingsModel();
			expect(newSettingsModel.server()).toBe('euw');

			newSettingsModel.server('na');
			expect(newSettingsModel.server()).toBe('na');

			newSettingsModel.reset();
			expect(newSettingsModel.server()).toBe('euw');
		});
	});
	describe("saveAndCloseHandler ", function () {
		function requestSummonerId(server, name) {

			return request;
		}

		it("should not make a request if summonerUnchanged returns true", function () {
			spyOn(settingsCtrl, ['summonerUnchanged']).and.returnValue(true);
			settingsCtrl.constructor.close = jasmine.createSpy('"settingsCtrl.constructor.close spy"');
			settingsCtrl.odkWindow = {name: 'Settings'};

			jasmine.Ajax.install();

			settingsCtrl.saveAndCloseHandler(settingsCtrl, $('<div class="btn"></div>'));

			var request = jasmine.Ajax.requests.mostRecent();
			expect(request).toBeUndefined();
			jasmine.Ajax.uninstall();
		});
		it("should make a request to {BaseUrl}/getSummonerId.php?server={server}&summoner={summonerName}", function () {
			var server = 'euw', name = 'Test';
			spyOn(settingsCtrl, ['summonerUnchanged']).and.returnValue(false);
			settingsCtrl.constructor.close = jasmine.createSpy('"settingsCtrl.constructor.close spy"');
			settingsCtrl.odkWindow = {name: 'Settings'};

			jasmine.Ajax.install();

			settingsCtrl.options.settings.server(server);
			settingsCtrl.options.settings.summonerName(name);
			settingsCtrl.saveAndCloseHandler(settingsCtrl, $('<div class="btn"></div>'));

			var request = jasmine.Ajax.requests.mostRecent();
			expect(request.url).toContain('/getSummonerId.php?server=' + server + '&summoner=' + name);
			jasmine.Ajax.uninstall();
		});
		it("should call close after successful request", function () { // TODO: fails because closeSettings is called within setTimeout
			var server = 'euw', name = 'Test';
			spyOn(settingsCtrl, ['summonerUnchanged']).and.returnValue(false);
			settingsCtrl.closeSettings = jasmine.createSpy('"settingsCtrl.closeSettings spy"');
			settingsCtrl.odkWindow = {name: 'Settings'};

			jasmine.Ajax.install();

			settingsCtrl.options.settings.server(server);
			settingsCtrl.options.settings.summonerName(name);
			settingsCtrl.saveAndCloseHandler(settingsCtrl, $('<div class="btn"></div>'));

			var request = jasmine.Ajax.requests.mostRecent();
			request.respondWith({
				"status": 200,
				"contentType": 'text/plain',
				"responseText": '123456'
			});

			expect(settingsCtrl.closeSettings).toHaveBeenCalled();
			jasmine.Ajax.uninstall();
		});
		it("should not call close after failed request", function () {
			var server = 'euw', name = 'Test';
			spyOn(settingsCtrl, ['summonerUnchanged']).and.returnValue(false);
			settingsCtrl.constructor.close = jasmine.createSpy('"settingsCtrl.constructor.close spy"');
			settingsCtrl.odkWindow = {name: 'Settings'};

			jasmine.Ajax.install();

			settingsCtrl.options.settings.server(server);
			settingsCtrl.options.settings.summonerName(name);
			settingsCtrl.saveAndCloseHandler(settingsCtrl, $('<div class="btn"></div>'));

			var request = jasmine.Ajax.requests.mostRecent();
			request.respondWith({
				"status": 404,
				"contentType": 'text/plain',
				"responseText": 'Not Found'
			});

			expect(settingsCtrl.constructor.close).not.toHaveBeenCalled();
			jasmine.Ajax.uninstall();
		});
		describe("error-code handling", function () { // TODO: write tests
			// https://developer.riotgames.com/docs/response-codes
			describe("400 - Bad Request", function () {
				//This error indicates that there is a syntax error in the request and the request has therefore been denied. The client should not continue to make similar requests without modifying the syntax or the requests being made.
				//
				//	Common Reasons
				//A provided parameter is in the wrong format (e.g., a string instead of an integer)
				//A required parameter was not provided
			});
			describe("401 - Unauthorized", function () {
				//This error indicates that the API request being made did not contain the necessary authentication credentials and therefore the client was denied access. If authentication credentials were already included then the Unauthorized response indicates that authorization has been refused for those credentials. In the case of the API, authorization credentials refer to your API key.
				//
				//	Common Reasons
				//No API key was provided with the API request
				//An invalid API key was provided with the API request
				//The API request was for an incorrect or unsupported path
			});
			describe("404 - Not Found", function () {
				//This error indicates that the server has not found a match for the API request being made. No indication is given whether the condition is temporary or permanent.
				//
				//	Common Reasons
				//The ID or name provided does not match any existing resource (e.g., there is no summoner matching the specified ID)
				//The API request was for an incorrect or unsupported path
			});
			describe("429 - Rate Limit exceeded", function () {
				//This error indicates that the application has exhausted its maximum number of allotted API calls allowed for a given duration. If the client receives a Rate Limit Exceeded response the client should process this response and halt future API calls for the duration, in seconds, indicated by the Retry-After header. Due to the increased frequency of clients ignoring this response, applications that are in violation of this policy may be disabled to preserve the integrity of the API.
				//
				//	Common Reasons
				//Unregulated API calls. Check your API Call Graphs to monitor your Dev and Production API key activity.
			});
			describe("500 - internal server error", function () {
			// This error indicates an unexpected condition or exception which prevented the server from fulfilling an API request.
			});
			describe("503 - Service temporarily unavailable", function () {
				//This error indicates the server is currently unavailable to handle requests because of an unknown reason. The Service Unavailable response implies a temporary condition which will be alleviated after some delay.
			});
		});
	});

	describe("click on a hotkey-button (.hotkey-btn click) ", function () {
		var $hotkeyBtn, $hotkeyRows;
		var hotkeyBtnClass = 'hotkey-btn';
		var hotkeyRowsIds = 'hotkey-rows';
		function setUpHTMLHotkeyButtonFixture() {
			jasmine.getFixtures().set('' +
				'<html><body><a href="" class="' + hotkeyBtnClass + '"></body></html>'
			);
		}
		beforeEach(function () {
			setUpHTMLHotkeyButtonFixture();
			$hotkeyBtn = $('.' + hotkeyBtnClass);
			$hotkeyRows = $('#' + hotkeyRowsIds);
			spyOn(settingsCtrl.options.settings, 'loadHotKeys').and.returnValue($.Deferred().resolve().promise());
			//settingsModel.loadHotKeys = jasmine.createSpy('"loadHotKeys spy"');
			 settingsCtrl = new SettingsCtrl('html', {settings: settingsModel});

			SettingsModel.getHotKeys = jasmine.createSpy('"getHotKeys spy"');
			$hotkeyBtn.click();
		});
		xit("should add a listener to document listening for focus-event", function () { // NOTE: somehow bugs the next Test!?
			expect($._data(document, 'events').focus).toBeDefined();
			expect($._data(document, 'events').focus).not.toBeEmpty();
		});
		it("should call renderView after loading the Hotkeys", function () {
			settingsCtrl.renderView = jasmine.createSpy('"renderView spy"').and.callFake(function () { });

			$hotkeyBtn.click();
			$(document).blur();
			$(document).focus();
			expect(settingsCtrl.renderView).toHaveBeenCalled();

		});
	});
});
