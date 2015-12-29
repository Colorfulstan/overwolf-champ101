import SettingsModel from 'SettingsModel';

describe('SettingsModel', function () {
	var settings;
	beforeEach(function () {
		settings = new SettingsModel();
	});
	describe('hasValueChanged() || ', function () {
		it('should return false on a new Instance', function () {
			var expected = false;
			var actual = settings.hasValueChanged('summonerName');
			expect(actual).toEqual(expected);
		});
		it('should return false if Value changed back to the old value', function () {
			var expected = false;

			settings.summonerName('123');
			expect(settings.hasValueChanged('summonerName')).toEqual(true);

			settings = new SettingsModel();
			settings.summonerName('321');
			expect(settings.hasValueChanged('summonerName')).toEqual(true);
			settings.summonerName('123');
			expect(settings.hasValueChanged('summonerName')).toEqual(false);
		});
		it('should return true if old and new Value differ', function () {
			settings.summonerName('321');
			expect(settings.hasValueChanged('summonerName')).toEqual(true);
		});
	});
});