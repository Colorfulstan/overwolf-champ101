import SettingsModel from 'SettingsModel';

describe('SettingsModel', function () {
	var settings;
	beforeEach(function () {
		settings = new SettingsModel();
	});
	describe('hasValueChanged() || ', function () {
		it('should return false on a new Instance', function () {
			var expected = false;
			var actual = settings.hasValueChanged('cachedGameId');
			expect(actual).toEqual(expected);
		});
		it('should return false if Value changed back to the old value', function () {
			var expected = false;

			settings.cachedGameId('123');
			expect(settings.hasValueChanged('cachedGameId')).toEqual(true);

			settings.changedPropsOriginalValues = {};
			settings.cachedGameId('321');
			expect(settings.hasValueChanged('cachedGameId')).toEqual(true);
			settings.cachedGameId('123');
			expect(settings.hasValueChanged('cachedGameId')).toEqual(false);
		});
		it('should return true if old and new Value differ', function () {
			settings.cachedGameId('321');
			expect(settings.hasValueChanged('cachedGameId')).toEqual(true);
		});
	});
});