import MatchModel from 'MatchModel';

describe('MatMatch || ', function () {

	it('takes summonerId and server as Constructor Arguments and sets the attr() achordingly', function () {
		var model = new MatchModel(1234, 'EUW');
		expect(model.summonerId).toBe(1234);
		expect(model.server).toBe('EUW');
	});
});
