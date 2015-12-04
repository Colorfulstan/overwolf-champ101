import MatchCtrl from 'MatchCtrl';
import SettingsModel from 'SettingsModel';

describe("MatchCtrlSpec - ", function () {
	var matchCtrl, settings;
	beforeEach(function () {
		settings = new SettingsModel();
		matchCtrl = new MatchCtrl('html', {settings: settings});
	});

});
