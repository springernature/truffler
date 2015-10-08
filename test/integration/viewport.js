// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var truffler = require('../..');

describe('Truffler Custom Viewport', function() {
	var testResult;

	before(function(done) {

		// Create a Truffler instance
		var test = truffler(function(browser, page, completeTest) {
			page.evaluate(function() {
				/* global window */
				return {
					width: window.innerWidth,
					height: window.innerHeight
				};
			}, completeTest);
		});

		// Run a test
		var options = {
			page: {
				viewport: {
					width: 1234,
					height: 5678
				}
			}
		};
		test.run(this.website.url + '/basic', options, function(error, result) {
			testResult = result;
			done(error);
		});

	});

	it('create a page with the expected viewport size', function() {
		assert.strictEqual(testResult.width, 1234);
		assert.strictEqual(testResult.height, 5678);
	});

});
