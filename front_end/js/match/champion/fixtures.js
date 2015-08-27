//// map fixtures for this application
//var fixtures = require('can/util/fixture/');
//// TODO: make this work
//can.fixture({
//	// findAll
//	"GET /champ": function() {
//		return TODOS
//	},
//	// findOne
//	"GET /champ/team/{index}": function( orig ) {
//		return TODOS[(+orig.data.id) - 1];
//	},
//	// create
//	"POST /todos": function( request ) {
//		TODOS.push(request.data);
//		return {
//			id: TODOS.length
//		}
//	},
//	// update
//	//"PUT /todos/{id}": function(request) {
//	//	steal.dev.log('request:', request);
//	//	return TODOS.splice(request.data.id - 1, 1 , request.data);
//	//},
//	// destroy
//	"DELETE /champ/team{index}": function() {
//		return {};
//	}
//});