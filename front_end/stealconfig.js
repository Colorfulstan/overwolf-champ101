System.config({
	paths: {
		'jquery/jquery': './node_modules/jquery/dist/jquery.js',
		'can':'./node_modules/can/can.js',
		'can/*':'./node_modules/can/*.js',

		'SettingsModel': './js/settings/SettingsModel.js',
		'SettingsCtrl': './js/settings/SettingsCtrl.js',

		'MatchDAO': './js/match/MatchDAO.js',
		'MatchModel': './js/match/MatchModel.js',
		'MatchCtrl': './js/match/MatchCtrl.js',
		'ImageModel': './js/match/ImageModel.js',

		'TooltipCtrl': './js/match/tooltip/TooltipCtrl.js',
		'OverviewCtrl': './js/match/overview-panel/OverviewCtrl.js',
		'ChampionCtrl': './js/match/champion-panel/ChampionCtrl.js',
		'ChampionModel': './js/match/champion-panel/ChampionModel.js',
		'SpellModel': './js/match/champion-panel/SpellModel.js',

		'WindowCtrl': './js/WindowCtrl.js',
		'global': './js/global.js',
		'Routes': './js/Routes.js',
		'MainCtrl': './js/MainCtrl.js',
		'FeedbackCtrl': './js/feedback/FeedbackCtrl.js'
	}
});