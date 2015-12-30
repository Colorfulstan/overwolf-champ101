"use strict";
steal(function () {
	var analyticsMock = {
		event: jasmine.createSpy('analytics.event Stub').and.callFake(function () {}),
		screenview: jasmine.createSpy('analytics.screenview Stub').and.callFake(function () {}),
		runWhenReady: jasmine.createSpy('analytics.runWhenReady Stub').and.callFake(function () {}),
		init: jasmine.createSpy('analytics.init')
	};

	return analyticsMock;
});