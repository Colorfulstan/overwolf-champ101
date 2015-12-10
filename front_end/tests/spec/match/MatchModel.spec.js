import MatchModel from 'MatchModel';

describe("MatMatch || ", function () {

	it("takes summonerId and server as Constructor Arguments and sets the attr() achordingly", function () {
		var model = new MatchModel(1234, 'EUW');
		expect(model.attr('summonerId')).toBe(1234);
		expect(model.attr('server')).toBe('EUW');
	});
});
