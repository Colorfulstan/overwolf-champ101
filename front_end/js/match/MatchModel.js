"use strict";
// load all data into Lists / Maps
var MatchModel = can.Model({
	init: function () {

		this.blueTeam = can.List();
		this.purpleTeam= can.List();
	}
});
module.exports = MatchModel;