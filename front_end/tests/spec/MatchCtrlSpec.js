import MatchCtrl from 'MatchCtrl';
import SettingsModel from 'SettingsModel';

describe("MatchCtrlSpec - ", function () {
	var matchCtrl, settings;
	beforeEach(function () {
		settings = new SettingsModel();
		matchCtrl = new MatchCtrl('html', {settings: settings});
	});
	describe("addDocumentEventhandlers() ", function () {
		var domNode, callback;
		beforeEach(function () {
			callback = jasmine.createSpy('"documentEventHandlers callback spy"');
			domNode = $('<div></div>').get(0)
			matchCtrl.addDocumentEventhandlers($(domNode), callback);
		});
		afterEach(function () {
			matchCtrl.removeDocumentEventhandlers($(domNode));
		});
		it("should add eventListener to document for blur", function () {
			expect($._data(domNode, 'events').blur).toBeDefined();
			expect($._data(domNode, 'events').blur).not.toBeEmpty();
		});

		it("should call _addBlurHandler when element looses focus", function () {
			matchCtrl._addBlurHandler = jasmine.createSpy('"matchCtrl._addBlurHandler spy"');

			$(domNode).blur();
			expect(matchCtrl._addBlurHandler).toHaveBeenCalled();
		});

		// These tests are more about _add/_removeBlurHandler
		it("should add eventListener to overwolf.games.inputTracking.onMouseUp", function () {
			expect(overwolf.games.inputTracking.onMouseUp.addListener).toHaveBeenCalledWith(callback);
		});
	});
});
