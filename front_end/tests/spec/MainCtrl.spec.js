import MainCtrl from 'MainCtrl';
import SettingsModel from 'SettingsModel';
import analytics from '../helper/analyticsMock';

describe("MainCtrlSpec - testing the Main-Window", function () {
	var mainCtrl, settingsModel;

	function setUpHTMLButtonsFixture() {
		jasmine.getFixtures().set('' +
			'<div class="app-buttons">' +
			'<div class="btn btn-match icon"></div>' +
			'<div class="btn btn-settings icon"></div>' +
			'<div class="btn btn-minimize icon"></div>' +
			'<div class="btn btn-close icon"></div>' +
			'</div>' +
			'<i class="btn fa fa-search btn-match"></i>'
		);
	}

	beforeEach(function () {
		mainCtrl = new MainCtrl('html');
		settingsModel = new SettingsModel();
	});
	afterEach(function () {
		if (mainCtrl.destroy !== 'undefined') {
			mainCtrl.destroy();
		}
	});

	describe(".app-buttons", function () {
		beforeEach(function () {
			setUpHTMLButtonsFixture();
		});

		it("should have div.app-buttons and the expected buttons", function () {
			expect($('div.app-buttons')).toBeInDOM();
			expect($('.btn-match')).toBeInDOM();
			expect($('.btn-settings')).toBeInDOM();
			expect($('.btn-minimize')).toBeInDOM();
			expect($('.btn-close')).toBeInDOM();
			expect($('i.btn-match')).toBeInDOM();
		});
		it(".app-buttons .btn-match should call static openMatch on WindowCtrl", function () {
			WindowCtrl.openMatch = jasmine.createSpy('"MainCtrl.openMatch spy"');

			$('.btn-match').trigger('mousedown');

			expect(WindowCtrl.openMatch).toHaveBeenCalled();
		});
	});
	//xdescribe(".start() || ", function () {
	//	describe("if started with false (no summoner set)", function () {
	//		it("should open settings window", function () {
	//			// TODO
	//			fail();
	//		});
	//		it("should set startWithGame(true)", function () {
	//			// TODO
	//			fail();
	//		});
	//		it("should set closeMatchWithGame(true)", function () {
	//			// TODO
	//			fail();
	//		});
	//	});
	//})
});