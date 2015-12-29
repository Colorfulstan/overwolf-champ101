import can from "can";
import analyticsMock from '../helper/analyticsMock';
import WindowCtrl from "WindowCtrl";
import Routes from "Routes";

describe("WindowCtrlSpec - ", function () {
	var winCtrl;

	beforeEach(function () {
		WindowCtrl.analytics.event = analyticsMock.event;
	});
	afterEach(function () {
		if (winCtrl && winCtrl.destroy !== 'undefined') {
			winCtrl.destroy();
		}
	});

	function setUpHTMLButtonsFixture() {
		jasmine.getFixtures().set('' +
			'<div class="drag-window-handle">' +
			'<div class="btn btn-resize icon"></div>' +
			'<div class="btn btn-minimize icon"></div>' +
			'<div class="btn btn-settings icon"></div>' +
			'<div class="btn btn-info icon"></div>' +
				//'<div class="btn btn-help icon"></div>' +
				//'<div class="btn btn-feedback icon"></div>' +
			'<div class="btn btn-close icon"></div>' +
			'</div>'
		);
	}

	function setupBtnMethodSpies(expectedMethodName) {
		winCtrl.constructor[expectedMethodName] = jasmine.createSpy('"winCtrl.constructor.' + expectedMethodName + ' spy"');
		// preferred
		WindowCtrl[expectedMethodName] = jasmine.createSpy('"WindowCtrl.' + expectedMethodName + ' spy"'); // possible and convenient (same as above)
		winCtrl[expectedMethodName] = jasmine.createSpy('"winCtrl.' + expectedMethodName + ' spy"'); // not possible!
	}

	function setupHTMLWhatsThisFixture() {
		jasmine.getFixtures().set('' +
			'<div id="buttons">' +
			'<div><a title="whatsThis0" class="whats-this" href="#"></a></div>"' +
			'<div><a title="whatsThis1" class="whats-this" href="#"></a></div>"' +
			'<div><a title="whatsThis2" class="whats-this" href="#"></a></div>"' +
			'<div><a title="whatsThis3" class="whats-this" href="#"></a></div>"' +
			'<div><a title="whatsThis4" class="whats-this" href="#"></a></div>"' +
			'</div>'
		)
	}

	function mouseDown(/** boolean */ mainButton, /** string */ cssSelector) {
		var which;
		(mainButton) ? which = 1 : which = 2; // leftclick?
		var $el = $(cssSelector);
		var event = jQuery.Event("mousedown", {
			which: which
		});
		$el.trigger(event);
	}

	xdescribe(".whats-this links should ", function () { // TODO: tests are not working
		beforeEach(function () {
			setupHTMLWhatsThisFixture();
			winCtrl = new WindowCtrl('html');
		});
		it(" be in DOM", function () {
			console.log($('.whats-this')[0]);
			expect($('.whats-this').length > 0).toBeTruthy();
		});
		it("display the title of the <a> element as div.whats-this-display", function () {
			var el = $('.whats-this')[2];
			$(el).trigger('click');
			expect($('.whats-this-display').text()).toBe($(el).attr('title'));
		});
		it("only open one display at a time", function () {
			$('.whats-this').each(function () {
				$(this).click();
			});
			expect($('.whats-this-display').length).toBe(1);
		});
		it("display the title of the last clicked .whats-this", function () {
			$('.whats-this').each(function () {
				$(this).click();
				expect($('.whats-this-display').text()).toBe($(this).attr('title'));
			});
		});
		it("close the display when same link is clicked again", function () {
			var el = $('.whats-this')[1];
			$(el).click();
			expect($('.whats-this-display')[0]).toBeInDOM();
			$(el).click();
			expect($('.whats-this-display')[0]).not.toBeInDOM();
		});
		it("be able to open a new display without closing the old one", function () {
			var $elements = $('.whats-this');
			$elements[1].click();
			var displaySelector = '.whats-this-display';
			expect($(displaySelector)[0]).toBeInDOM();
			$elements[3].click();
			expect($(displaySelector)[0]).toBeInDOM();
			expect($(displaySelector).text()).toBe($elements[3].title);
		});
	});
	describe("Buttons ", function () {
		beforeEach(function () {
			setUpHTMLButtonsFixture();
			winCtrl = new WindowCtrl('html');
		});
		it("should have the expected buttons", function () {
			expect($('.drag-window-handle')).toBeInDOM();
			expect($('.btn-resize')).toBeInDOM();
			expect($('.btn-minimize')).toBeInDOM();
			expect($('.btn-settings')).toBeInDOM();
			expect($('.btn-info')).toBeInDOM();
			//expect($('.btn-help')).toBeInDOM();
			//expect($('.btn-feedback')).toBeInDOM();
			expect($('.btn-close')).toBeInDOM();
		});
		it("mousedown on a button within .drag-window-handle should not result in dragging", function () {

			var methodName = 'dragMove';
			setupBtnMethodSpies(methodName);

			mouseDown(true, '.btn-resize');
			mouseDown(true, '.btn-minimize');
			mouseDown(true, '.btn-settings');
			mouseDown(true, '.btn-info');
			//mouseDown(true, '.btn-help');
			//mouseDown(true, '.btn-feedback');
			mouseDown(true, '.btn-close');
			expect(WindowCtrl[methodName]).not.toHaveBeenCalled();
		});

		describe("left MouseButton down calls the associated method", function () {
			it(".drag-window-handle - WindowCtrl.dragMove", function () {
				var methodName = 'dragMove';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.drag-window-handle');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();
			});
			it(".btn-resize - WindowCtrl.dragResize", function () {
				var methodName = 'dragResize';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.btn-resize');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();
			});
			it(".btn-minimize - WindowCtrl.minimize", function () {
				var methodName = 'minimize';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.btn-minimize');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();
			});
			it(".btn-settings - WindowCtrl.openSettings", function () {
				var methodName = 'openSettings';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.btn-settings');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();

			});
			it(".btn-info - WindowCtrl.openMain", function () {
				var methodName = 'openMain';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.btn-info');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();
			});
			it(".btn-close - WindowCtrl.close", function () {
				var methodName = 'close';
				setupBtnMethodSpies(methodName);
				mouseDown(true, '.btn-close');
				expect(WindowCtrl[methodName]).toHaveBeenCalled();
				// TODO: test if correct name is given?
			});
		});
		describe("right MouseButton down should be ignored for", function () {
			it(".btn-minimize", function () {
				var methodName = 'minimize';
				setupBtnMethodSpies(methodName);
				mouseDown(false, '.btn-minimize');
				expect(WindowCtrl[methodName]).not.toHaveBeenCalled();
			});
			it(".btn-settings", function () {
				var methodName = 'openSettings';
				setupBtnMethodSpies(methodName);
				mouseDown(false, '.btn-settings');
				expect(WindowCtrl[methodName]).not.toHaveBeenCalled();

			});
			it(".btn-info", function () {
				var methodName = 'openMain';
				setupBtnMethodSpies(methodName);
				mouseDown(false, '.btn-info');
				expect(WindowCtrl[methodName]).not.toHaveBeenCalled();
			});
			it(".btn-close", function () {
				var methodName = 'close';
				setupBtnMethodSpies(methodName);
				mouseDown(false, '.btn-close');
				expect(WindowCtrl[methodName]).not.toHaveBeenCalled();
				// TODO: test if correct name is given?
			});
		});

	});
	//describe("Routes ", function () {
	//	beforeAll(function () {
	//		//Routes.ready();
	//	});
	//	beforeEach(function () {
	//		winCtrl = new WindowCtrl('html');
	//	});
	//	afterEach(function () {
	//		can.route.attr({}, true); // reset the route
	//	});
	//	describe(Routes.toggleWindow + " should ", function () {
	//		it("redirect to route " + Routes.expandPanels, function () {
	//			//can.fixture()
	//			can.route.attr({'route': Routes.toggleWindow});
	//			expect(can.route.attr('route')).toBe(Routes.expandPanels);
	//			// seems to be working, but test fails because can.attr('route') is ''
	//		});
	//		it("call WindowCtrl.toggle with the given parameter for window", function () {
	//			WindowCtrl.toggle = jasmine.createSpy('"WindowCtrl.toggle spy"');
	//			can.route.attr({'route': Routes.toggleWindow, 'window': 'test'});
	//			expect(WindowCtrl.toggle).toHaveBeenCalledWith('test');
	//		});
	//	});
	//
	//});

	describe("WindowCtrl.events | ", function () {
		var handlerMock;

		var registerAndCallHandlerAndRemoveAgain = function (_handler) {
			$(WindowCtrl.events).on('someEvent', _handler);
			$(WindowCtrl.events).trigger('someEvent');
			$(WindowCtrl.events).off('someEvent');
		};
		beforeEach(function () {
			handlerMock = jasmine.createSpy('eventHandler');
			//winCtrl = new WindowCtrl();
			//WindowCtrl.events = {};
		});

		it("should exist", function () {
			var actual = WindowCtrl.events;
			expect(actual).toBeDefined();
			expect(WindowCtrl.events.on).toBeDefined();
			expect(WindowCtrl.events.trigger).toBeDefined();
		});
		it("should make it possible to register and trigger events", function () {
			$(WindowCtrl.events).on('someEvent', handlerMock);

			$(WindowCtrl.events).trigger('someEvent');
			$(WindowCtrl.events).trigger('someEvent');

			expect(handlerMock).toHaveBeenCalled();
			expect(handlerMock.calls.count()).toBe(2);
		});
		it("should make it possible to register and trigger events through method", function () {
			WindowCtrl.events.on('someEvent', handlerMock);

			WindowCtrl.events.trigger('someEvent');
			WindowCtrl.events.trigger('someEvent');

			expect(handlerMock).toHaveBeenCalled();
			expect(handlerMock.calls.count()).toBe(2);
		});
		it("triggering an Event should set a localStorage value acchordingly", function () {
			var expected = 'storageEvent';
			WindowCtrl.events.on(expected, handlerMock);

			WindowCtrl.events.trigger(expected);
			expect(handlerMock).toHaveBeenCalled();

			var actual = localStorage.getItem('eventFired');
			expect(actual).toContain(expected);
		});
		it("should listen to storageEvent and trigger event acchordingly", function () {
			WindowCtrl.enableStorageEvents();
			WindowCtrl.events.on('thisEvent', handlerMock);

			var key = 'eventFired',
				newValue = 'thisEvent||dshdshsjheswhateverDate';

			var se = document.createEvent('StorageEvent');
			se.initStorageEvent('storage', false, false, key, null, newValue, '/', null);
			window.dispatchEvent(se);

			expect(handlerMock).toHaveBeenCalled();
		});

		it("should enable subControllers to register and trigger events from instance", function () {
			var WindowSubCtrl = WindowCtrl.extend('WindowSubCtrl', {}, {
				testInstance: registerAndCallHandlerAndRemoveAgain
			});

			var test = new WindowSubCtrl();
			test.testInstance(handlerMock);

			expect(handlerMock).toHaveBeenCalled();
			expect(handlerMock.calls.count()).toBe(1);
		});
		it("should enable subControllers to register and trigger events from static", function () {
			// static call
			var WindowSubCtrl = WindowCtrl.extend('WindowSubCtrl', {
				testStatic: registerAndCallHandlerAndRemoveAgain
			}, {});
			WindowSubCtrl.testStatic(handlerMock);

			// call from instance
			var test = new WindowSubCtrl();
			test.constructor.testStatic(handlerMock);

			expect(handlerMock).toHaveBeenCalled();
			expect(handlerMock.calls.count()).toBe(2);
		});
	});
});