steal(
	'js/boot.js'
	, function () {
		xdescribe("mainSpec.js - including dependencies from boot.js", function () {
			it("Test-Dependencies are defined", function () {
				expect(window.MainCtrl).toBeDefined('MainCtrl');
				expect(window.Routes).toBeDefined('Routes');
				expect(window.SettingsModel).toBeDefined('SettingsModel');
			});
		});
	});