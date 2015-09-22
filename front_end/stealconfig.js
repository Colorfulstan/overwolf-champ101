System.config({
	paths: {
		'jquery/jquery': './node_modules/jquery/dist/jquery.js',
		'can':'./node_modules/can/can.js',
		'can/*':'./node_modules/can/*.js',
		'materialize':'./node_modules/materialize-css/bin/materialize.js',

		'Hotkeys': './js/Utility/Hotkeys.js',
		'Routes': './js/Utility/Routes.js',

		'SettingsModel': './js/settings/SettingsModel.js',
		'SettingsCtrl': './js/settings/SettingsCtrl.js',

		'MatchDAO': './js/match/MatchDAO.js',
		'MatchModel': './js/match/MatchModel.js',
		'MatchCtrl': './js/match/MatchCtrl.js',
		'ImageModel': './js/match/Elements/ImageModel.js',
		'SpellModel': './js/match/Elements/SpellModel.js',

		'TooltipCtrl': './js/match/Elements/tooltip/TooltipCtrl.js',
		'OverviewCtrl': './js/match/Elements/overview-panel/OverviewCtrl.js',
		'ChampionCtrl': './js/match/Elements/champion-panel/ChampionCtrl.js',
		'ChampionModel': './js/match/Elements/champion-panel/ChampionModel.js',

		'WindowCtrl': './js/WindowCtrl.js',
		'global': './js/Utility/global.js',
		'MainCtrl': './js/MainCtrl.js',
		'FeedbackCtrl': './js/feedback/FeedbackCtrl.js',


		'steal-jasmine': './node_modules/steal-jasmine/steal-jasmine.js',
		'jasmine-core/*': './node_modules/jasmine-core/*.js'
	}
});