/**
 * include Spec-files here
 *
 * include Source-files within the spec-files
 */
steal(
	'steal-jasmine.js',
	'../lib/jasmine-ajax.js',
	'../lib/jasmine-fixture/jasmine-fixture.js',
	'../lib/jasmine-jquery.js',

	'../helper/overwolfMock.js',
	'./DocumentationSpec.js',
	'./mainSpec.js',
	'./settingsSpec.js',
	'./matchSpec.js'
	, function (jasmineRequire) {
		beforeEach(function () {
			localStorage.clear();

		});

		afterEach(function () {
		});

		afterAll(function () {

			window.setTimeout(function () { // modifying the html output after it has been generated
				$('.stack-trace').each(function () {
					// marking the relevant lines of stacktraces after
					// all tests have been run and text got inserted into the DOM
					var html = $(this).html().replace(/(.*tests\/spec.*)/, '<strong style="color:blue;">$1</strong>');
					$(this).html(html);
				});

				$('.suite').each(function () { // modifying suites
					var $specs = $(this).find('.specs');
					var countSpecs = $specs.children().length;
					if (countSpecs > 0 && countSpecs == $specs.children('.disabled').length)
						$(this).remove();// remove suites that are disabled and not empty

					if (countSpecs > 0 && countSpecs == $specs.children('.passed').length)
						$(this).remove(); // remove suites that are not empty and passed completely
				});
			}, 10);
		});
	});