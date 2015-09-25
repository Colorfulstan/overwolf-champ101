steal(function () {
	describe("DocumentationSpec", function () {
		it("Steal-jasmine is working", function () { expect(true).toBe(true); });
		it("Set a localstorage entry", function () {
			localStorage.setItem('testItem', 'set');
			expect(localStorage.getItem('testItem')).toEqual('set');
		});
		it("index.js beforeEach() clears localstorage before each Test, even when not within the same spec-file", function () {
			expect(localStorage.getItem('testItem')).toBeNull();
		});
		it("overwolf should be defined as Stub or Mock", function () {
			expect(window.overwolf).toBeDefined();
		});
		describe("jasmine-ajax mocking", function () {
			var request;
			var onSuccess, onFailure;
			// 1. Defining test responses
			var TestResponses = {
				search: {
					success: {
						status: 200,
						responseText: '{"response":{"groups":[{"type":"nearby","name":"Nearby","items":[{"id":"4bb9fd9f3db7b7138dbd229a","name":"Pivotal Labs","contact":{"twitter":"pivotalboulder"},"location":{"address":"1701 Pearl St.","crossStreet":"at 17th St.","city":"Boulder","state":"CO","lat":40.019461,"lng":-105.273296,"distance":0},"categories":[{"id":"4bf58dd8d48988d124941735","name":"Office","pluralName":"Offices","icon":"https://foursquare.com/img/categories/building/default.png","parents":["Homes, Work, Others"],"primary":true}],"verified":false,"stats":{"checkinsCount":223,"usersCount":62},"hereNow":{"count":0}},{"id":"4af2eccbf964a5203ae921e3","name":"Laughing Goat Café","contact":{},"location":{"address":"1709 Pearl St.","crossStreet":"btw 16th & 17th","city":"Boulder","state":"CO","postalCode":"80302","country":"USA","lat":40.019321,"lng":-105.27311982,"distance":21},"categories":[{"id":"4bf58dd8d48988d1e0931735","name":"Coffee Shop","pluralName":"Coffee Shops","icon":"https://foursquare.com/img/categories/food/coffeeshop.png","parents":["Food"],"primary":true},{"id":"4bf58dd8d48988d1a7941735","name":"College Library","pluralName":"College Libraries","icon":"https://foursquare.com/img/categories/education/default.png","parents":["Colleges & Universities"]}],"verified":false,"stats":{"checkinsCount":1314,"usersCount":517},"hereNow":{"count":0}},{"id":"4ca777a597c8a1cdf7bc7aa5","name":"Ted\'s Montana Grill","contact":{"phone":"3034495546","formattedPhone":"(303) 449-5546","twitter":"TedMontanaGrill"},"location":{"address":"1701 Pearl St.","crossStreet":"17th and Pearl","city":"Boulder","state":"CO","postalCode":"80302","country":"USA","lat":40.019376,"lng":-105.273311,"distance":9},"categories":[{"id":"4bf58dd8d48988d1cc941735","name":"Steakhouse","pluralName":"Steakhouses","icon":"https://foursquare.com/img/categories/food/steakhouse.png","parents":["Food"],"primary":true}],"verified":true,"stats":{"checkinsCount":197,"usersCount":150},"url":"http://www.tedsmontanagrill.com/","hereNow":{"count":0}},{"id":"4d3cac5a8edf3704e894b2a5","name":"Pizzeria Locale","contact":{},"location":{"address":"1730 Pearl St","city":"Boulder","state":"CO","postalCode":"80302","country":"USA","lat":40.0193746,"lng":-105.2726744,"distance":53},"categories":[{"id":"4bf58dd8d48988d1ca941735","name":"Pizza Place","pluralName":"Pizza Places","icon":"https://foursquare.com/img/categories/food/pizza.png","parents":["Food"],"primary":true}],"verified":false,"stats":{"checkinsCount":511,"usersCount":338},"hereNow":{"count":2}},{"id":"4d012cd17c56370462a6b4f0","name":"The Pinyon","contact":{},"location":{"address":"1710 Pearl St.","city":"Boulder","state":"CO","country":"USA","lat":40.019219,"lng":-105.2730563,"distance":33},"categories":[{"id":"4bf58dd8d48988d14e941735","name":"American Restaurant","pluralName":"American Restaurants","icon":"https://foursquare.com/img/categories/food/default.png","parents":["Food"],"primary":true}],"verified":true,"stats":{"checkinsCount":163,"usersCount":98},"hereNow":{"count":1}}]}]}}'
					}
				}
			};
			// A good place to define this is in spec/javascripts/helpers/test_responses.
			// You can also define failure responses, for whatever status codes the API you are working with supports.

			beforeEach(function () {

				// 2. Installing the mock
				jasmine.Ajax.install();
				//After this, all Ajax requests will be captured by jasmine-ajax.
				// If you want to do things like load fixtures, do it before you install the mock.

				onSuccess = jasmine.createSpy('onSuccess');
				onFailure = jasmine.createSpy('onFailure');

				// 3. Triggering the ajax request code
				//Before you can specify that a request uses your test response, you must have a handle to the request itself.
				// This means that the request is made first by the code under test and then you will set your test response
				// (see next step).

				$.get('http://url.com', {}, onSuccess).fail(onFailure);
				request = jasmine.Ajax.requests.mostRecent();
				// The onreadystatechange event isn't fired to complete the ajax request until you set the response in the next step.
				expect(request.url).toBe('http://url.com');
				expect(request.method).toBe('GET');
				expect(request.data()).toEqual({});

			});
			afterEach(function () {
				jasmine.Ajax.uninstall();
				// freeing the AJAX requests from being caught by jasmine
			});
			describe("on success", function () {
				beforeEach(function () {

				// 4. Defining the response for each request
					//Now that you've defined some test responses and installed the mock, you need to tell jasmine-ajax
					// which response to use for a given spec.
					// If you want to use your success response for a set of related success specs, you might use:

					request.respondWith(TestResponses.search.success);

					//Now for all the specs in this example group, whenever an Ajax response is sent,
					// it will use the TestResponses.search.success object defined in your test responses
					// to build the XMLHttpRequest object.
				});
				it("calls onSuccess", function() {
					expect(onSuccess).toHaveBeenCalled();

					var successArgs = onSuccess.calls.mostRecent().args[0];
					expect(successArgs.length).toEqual(undefined);
					//expect(successArgs[0]).toEqual(jasmine.any(Array));
					expect(request.data()).toEqual({});

					//By default the data function is very naive about parsing form data being sent.
					//	The provided parsers are:

					//	If the XHR has a content-type of application/json, JSON.parse
					//Otherwise simply split query string by '&' and '='

					//If you need more control over how your data is presented,
					// you can supply a custom param parser. Custom parsers will be prepended to the list of parsers to try.
					//describe("custom params", function() {
					//	beforeEach(function() {
					//		jasmine.Ajax.install();
					//		jasmine.Ajax.addCustomParamParser({
					//			test: function(xhr) {
					//				// return true if you can parse
					//			},
					//			parse: function(params) {
					//				// parse and return
					//			}
					//		});
					//	});
					//});
				});
			});
			it("AJAX calls can be mocked through jasmine-ajax. Install is done beforAll, uninstall afterAll in the respective Suite", function () {

				// 5. Inspecting Ajax requests and setting expectations on them
			});
		});

		describe("jasmine-jquery", function () { // TODO

		});
		describe("jasmine-fixtures", function () { // TODO

		});
		describe("jasmine-fixtures / -jquery / -ajax together", function () { // TODO

		});

		it("can.Model s can be used wherever after included once (but still should be explicitly included)", function () {
			expect(window.MatchModel).toBeDefined();
		});
		it("can.Control s has to be included where they are needed", function () {
			expect(window.MainCtrl).toBeUndefined();
		});
	});
});