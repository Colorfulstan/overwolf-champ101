steal(
	'Hotkeys.js'
	, 'MatchDAO.js'
	, 'MatchModel.js'
	, 'SettingsModel.js'
	, 'MatchCtrl.js'
	, 'Routes.js'
	, 'steal-jasmine.js'
	, function (/** Hotkeys */ Hotkeys
		, /**MatchDAO*/ MatchDAO
		, /**MatchModel*/ MatchModel
		, /**SettingsModel*/ SettingsModel
		, /** MatchCtrl */ MatchCtrl
		, /** Routes */ Routes) {
		describe("matchSpec.js - including dependencies from match.js", function () {
			it("Test-Dependencies  are defined", function () {
				expect(Hotkeys).toBeDefined();
				expect(MatchDAO).toBeDefined();
				expect(MatchModel).toBeDefined();
				expect(SettingsModel).toBeDefined();
				expect(MatchCtrl).toBeDefined();
				expect(Routes).toBeDefined();
			});
		});
	});