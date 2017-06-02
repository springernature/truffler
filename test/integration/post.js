// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var truffler = require('../..');

describe('Truffler POST request', function () {
	var testResult;

	before(function (done) {
		// Create a Truffler instance
		var test = truffler(function (browser, page, options, completeTest) {
			page.evaluate(function () {
				/* global document */
				return {
					method: document.body.textContent.replace(/\s+/g, '')
				};
			}, completeTest);
		});

		// Run a test
		var options = {
			page: {
				settings: {
					operation: 'POST'
				}
			}
		};
		test.run(this.website.url + '/method', options, function (error, result) {
			testResult = result;
			done(error);
		});
	});

	it('requests the page with the expected method', function () {
		assert.strictEqual(testResult.method, 'POST');
	});
});
