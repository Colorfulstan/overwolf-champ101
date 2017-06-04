import MatchModel from 'MatchModel';

describe('MatMatch || ', function () {

	it('takes summonerId and server as Constructor Arguments and sets the attr() achordingly', function () {
		var model = new MatchModel('EUW');
		expect(model.server).toBe('EUW');
	});
});
