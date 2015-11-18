import MainCtrl from 'MainCtrl';
import SettingsModel from 'SettingsModel';

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
		it(".app-buttons .btn-match should call static openMatch on MainCtrl superclass", function () {
			mainCtrl.constructor.openMatch = jasmine.createSpy('"mainCtrl.constructor.openMatch spy"');
			MainCtrl.openMatch = jasmine.createSpy('"MainCtrl.openMatch spy"'); // possible but not "clean"
			mainCtrl.openMatch = jasmine.createSpy('"mainCtrl.openMatch spy"'); // not possible

			$('.btn-match').trigger('mousedown');

			expect(MainCtrl.openMatch).toHaveBeenCalled();
			expect(mainCtrl.constructor.openMatch).toHaveBeenCalled();

			expect(mainCtrl.openMatch).not.toHaveBeenCalled();
		});
	});
});