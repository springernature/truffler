// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var truffler = require('../..');

describe('Truffler Timeout', function() {
	var testError;

	before(function(done) {

		// Create a Truffler instance
		var test = truffler(function(browser, page, completeTest) {
			completeTest();
		});

		// Run a test
		var options = {
			timeout: 100
		};
		test.run(this.website.url + '/timeout', options, function(error) {
			testError = error;
			done();
		});

	});

	it('should report a timeout error', function() {
		assert.instanceOf(testError, Error);
		assert.strictEqual(testError.message, 'Truffler timed out (100ms)');
	});

});
