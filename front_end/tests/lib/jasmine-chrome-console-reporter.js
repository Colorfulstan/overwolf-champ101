/*
 jasmine-console.js Copyright (c) 2008-2013 Pivotal Labs

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 jasmine-chrome-console.js modifications by Adam Anderson, Falafel Software 2014
 */
function getJasmineRequireObj() {
	if (typeof module !== "undefined" && module.exports) {
		return exports;
	} else {
		window.jasmineRequire = window.jasmineRequire || {};
		return window.jasmineRequire;
	}
}

getJasmineRequireObj().console = function (jRequire, j$) {
	j$.ConsoleReporter = jRequire.ConsoleReporter();
};

getJasmineRequireObj().ConsoleReporter = function () {

	var noopTimer = {
		start: function () { },
		elapsed: function () { return 0; }
	};

	function ConsoleReporter(options) {
		var
			showColors = options.showColors || false,
			onComplete = options.onComplete || function () { },
			timer = options.timer || noopTimer,
			specCount,
			failureCount,
			failedSpecs = [],
			pendingCount;

		this.jasmineStarted = function () {
			specCount = 0;
			failureCount = 0;
			pendingCount = 0;
			console.log("Started");
			console.log('');
			timer.start();
		};

		this.jasmineDone = function () {
			console.log('');
			for (var i = 0; i < failedSpecs.length; i++) {
				specFailureDetails(failedSpecs[i]);
			}

			console.log('');
			var specCounts = specCount + " " + plural("spec", specCount) + ", " +
				failureCount + " " + plural("failure", failureCount);

			if (pendingCount) {
				specCounts += ", " + pendingCount + " pending " + plural("spec", pendingCount);
			}

			console.log(specCounts);

			console.log('');
			var seconds = timer.elapsed() / 1000;
			console.log("Finished in " + seconds + " " + plural("second", seconds));

			console.log('');

			onComplete(failureCount === 0);
		};

		this.suiteStarted = function (result) {
			console.group(result.description);
		}

		this.suiteDone = function (result) {
			console.groupEnd();
		}

		this.specDone = function (result) {
			specCount++;

			if (result.status == "pending") {
				pendingCount++;
				console.log('%c%s %s', 'color: orange', '_', result.description);
				return;
			}

			if (result.status == "passed") {
				console.log('%c%s %s', 'color: green', 'o', result.description);
				return;
			}

			if (result.status == "failed") {
				failureCount++;
				console.groupCollapsed('%c%s %s', 'color: red', 'x', result.description);
				for (var i = 0; i < result.failedExpectations.length; i++) {
					var failedExpectation = result.failedExpectations[i];
					console.log(failedExpectation.stack);
				}
				console.groupEnd();
			}
		};

		return this;

		function plural(str, count) {
			return count == 1 ? str : str + "s";
		}
	}

	return ConsoleReporter;
};
