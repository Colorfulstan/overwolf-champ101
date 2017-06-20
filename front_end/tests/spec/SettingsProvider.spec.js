import Settings from 'SettingsProvider';
import SettingsModel from 'SettingsModel';

describe('SettingsProvider (Settings) | ', function () {
	beforeEach(function () {
		Settings.instance = null;
	});
	it('should return the instance if thats not null', function () {
		var expected = {name: 'whatever'};
		Settings.instance = expected;
		var actual = Settings.getInstance();

		expect(actual).toBe(expected);
	});
	it('should return a new SetttingsModel if its the first call', function () {
		var expected = new SettingsModel();
		var actual = Settings.getInstance();

		expect(actual.attr()).toEqual(expected.attr());
	});
	it('should return SetttingsModel whose values are not saved for reset', function () {
		var expected = {};

		var settingsChanged = Settings.getInstance();
		settingsChanged.cachedGameId('123');
		var actual = settingsChanged.changedPropsOriginalValues;
		expect(actual).not.toEqual(expected);

		actual = Settings.getInstance().changedPropsOriginalValues;
		expect(actual).toEqual(expected);

	});
});