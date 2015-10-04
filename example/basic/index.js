'use strict';

var truffler = require('../..');

// Create a test instance with some default options
var test = truffler({

	// Log what's happening to the console
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	}

// The test function which will get run on URLs
}, function(browser, page, done) {

	// Evaluate the page, extract the title, and callback
	page.evaluate(
		function() {
			/* global document */
			return document.title;
		},
		function(error, result) {
			done(null, result);
		}
	);

});

// Test http://nature.com/
test.run('nature.com', function(error, result) {
	if (error) {
		return console.error(error.message);
	}
	console.log('The title of the page is: ' + result);
});
