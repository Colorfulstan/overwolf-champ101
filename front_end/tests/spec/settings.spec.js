steal(
	'SettingsCtrl.js'
	, 'Routes.js'
	, 'SettingsModel.js'
	, function (/**SettingsCtrl*/ SettingsCtrl
		, /**Routes*/ Routes
		, /**SettingsModel*/ SettingsModel) {
		describe("settingsSpec.js - including dependencies from settings.js", function () {
			it("Test-Dependencies are defined", function () {
				expect(SettingsCtrl).toBeDefined();
				expect(SettingsModel).toBeDefined();
				expect(Routes).toBeDefined();
			});
		});
	});