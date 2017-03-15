'use strict';

var truffler = require('../..');

var options = {
	// Log what's happening to the console
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	}
};

// Create a test instance with some default options
var test = truffler(options, function (browser, page, options, done) {
	// Evaluate the page, extract the title, and callback
	page.evaluate(
		function () {
			/* global document */
			return document.title;
		},
		function (error, result) {
			done(null, result);
		}
	);
});

// Test http://nature.com/
test.run('nature.com', function (error, result) {
	if (error) {
		return console.error(error.message);
	}
	console.log('The title of the page is: ' + result);
});
