steal(
	'js/main.js'
	, function () {
		xdescribe("mainSpec.js - including dependencies from main.js", function () {
			it("Test-Dependencies are defined", function () {
				expect(window.MainCtrl).toBeDefined('MainCtrl');
				expect(window.Routes).toBeDefined('Routes');
				expect(window.SettingsModel).toBeDefined('SettingsModel');
			});
		});
	});