'use strict';

var truffler = require('../..');

// Start truffling
truffler({

	// The test function which will get run on URLs
	testFunction: function (browser, page, done) {

		// Evaluate the page, extract the title, and callback
		page.evaluate(
			function () {
				/* global document */
				return document.title;
			},
			function (result) {
				done(null, result);
			}
		);

	}

}, function (error, test, exit) {

	// Test http://nature.com/
	test('nature.com', function (error, result) {

		// Log the result
		console.log('The title of the page is: ' + result);

		// Exit truffler
		exit();

	});

});
