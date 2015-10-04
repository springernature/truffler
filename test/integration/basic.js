// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var truffler = require('../..');

describe('Truffler Basic Reporting', function() {
	var testResult;

	before(function(done) {

		// Create a Truffler instance
		var test = truffler(function(browser, page, completeTest) {
			page.evaluate(function() {
				/* global document */
				return {
					title: document.title,
					body: document.body.textContent
				};
			}, completeTest);
		});

		// Run a test
		test.run(this.website.url + '/basic', function(error, result) {
			testResult = result;
			done(error);
		});

	});

	it('should report the title of a requested page', function() {
		assert.strictEqual(testResult.title, 'Basic Page');
	});

	it('should report the body text of the requested page', function() {
		assert.strictEqual(testResult.body.trim(), 'Hello World!');
	});

});
