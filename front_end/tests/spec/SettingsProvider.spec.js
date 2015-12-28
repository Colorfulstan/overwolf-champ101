import Settings from 'SettingsProvider';
import SettingsModel from 'SettingsModel';

describe('SettingsProvider (Settings) | ', function () {
	beforeEach(function () {
		Settings.instance = null;
	});
	it('should return the instance if thats not null', function () {
		var expected = "whatever";
		Settings.instance = expected;
		var actual = Settings.getInstance();

		expect(actual).toBe(expected);
	});
	it('should return a new SetttingsModel if its the first call', function () {
		var expected = new SettingsModel();
		var actual = Settings.getInstance();

		expect(actual.attr()).toEqual(expected.attr());
	});
});