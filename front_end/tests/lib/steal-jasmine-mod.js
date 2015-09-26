'format amd';
define(['./jasmine',
	'./jasmine-chrome-console-reporter',
	'./jasmine-boot-console',
	'jasmine-core/lib/jasmine-core/jasmine.css!'], function(jasmineRequire) {
	steal.done().then(function(){
		if (window.Testee) {
			Testee.init();
		}
		window.onload();
	});
	return jasmineRequire;
});
