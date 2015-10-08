// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var truffler = require('../..');

describe('Truffler Custom Headers', function() {
	var testResult;

	before(function(done) {

		// Create a Truffler instance
		var test = truffler(function(browser, page, completeTest) {
			page.evaluate(function() {
				/* global document */
				var headers = {};
				document.body.textContent.split(/\n+/).forEach(function(headerString) {
					var headerParts = headerString.split(':');
					var header = headerParts.shift();
					headers[header] = headerParts.join(':').trim();
				});
				return {
					headers: headers
				};
			}, completeTest);
		});

		// Run a test
		var options = {
			page: {
				headers: {
					Foo: 'bar',
					Cookie: 'foo=bar'
				}
			}
		};
		test.run(this.website.url + '/headers', options, function(error, result) {
			testResult = result;
			done(error);
		});

	});

	it('send the expected headers to the requested page', function() {
		assert.isObject(testResult.headers);
		assert.strictEqual(testResult.headers.foo, 'bar');
		assert.strictEqual(testResult.headers.cookie, 'foo=bar');
	});

});
