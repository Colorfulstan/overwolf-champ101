import Routes from 'Routes';

describe("Routes - ", function () {
	var removeOtherAttr;
	beforeEach(function () {
		spyOn(can.route, 'attr');
		can.route.attr.and.callFake(function () { });

		spyOn(window, 'setTimeout');
		window.setTimeout.and.callFake(function (cb) { cb(); });
		removeOtherAttr = true;
	});

	describe("setRoute() | ", function () {
		it("should be able to set the routes attribute", function () {
			var promise = Routes.setRoute('testRoute', removeOtherAttr);
			promise.then(function () {
				expect(can.route.attr).toHaveBeenCalledWith({route: 'testRoute'}, removeOtherAttr);
			});
		});
		it("should be able to set Route without altering the remaining attributes of can.route", function () {
			var routeString = 'Testroute keep attr';
			removeOtherAttr = false;
			var promise = Routes.setRoute(routeString, removeOtherAttr);
			promise.then(function () {
				expect(can.route.attr).toHaveBeenCalledWith({route: routeString}, removeOtherAttr);
			});
		});
		it("should keep the remaining attributes by default", function () {
			var routeString = 'Testroute keep attr';
			var promise = Routes.setRoute(routeString);
			promise.then(function () {
				expect(can.route.attr).toHaveBeenCalledWith({route: routeString}, false);
			});
		});
	});
	describe("resetRoute() | ", function () {
		it("should be able to reset the routes attribute (no route and no other attributes)", function () {
			var promise = Routes.resetRoute();
			promise.then(function () {
				expect(can.route.attr).toHaveBeenCalledWith({route: ''}, true);
			});
		});
	});
	describe("setRouteData() | ", function () {
		describe("should throw Error with | ", function () {
			it("empty string", function () {
				var routeData = '';
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
			it("numbers", function () {
				var routeData = 321;
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
			it("empty array", function () {
				var routeData = [];
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
			it("string", function () {
				var routeData = 'sdfhgdsf';
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
			it("array of objects", function () {
				var routeData = [{},{},{}];
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
			it("empty object", function () {
				var routeData = {};
				expect(function emptyString() {
					Routes.setRouteData(routeData);
				}).toThrow(new Error('routeData has no Properties!'));
			});
		});
		describe("should not throw error with | ", function () {
			it("object that has any property", function () {
					var routeData = {property: ''};
					expect(function emptyString() {
						Routes.setRouteData(routeData);
					}).not.toThrow(new Error('routeData: ' + routeData +' is not an object!'));
			});
		});
	});


	describe("attr() | ", function () {
		// TODO !?
	});
});
