'use strict';

var async = require('async');
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

// Use the async library to run multiple tests in series
// https://github.com/caolan/async
async.series({

	// Test the Nature home page
	home: test.run.bind(test, 'http://nature.com/'),

	// Test the Nature Plants home page
	plants: test.run.bind(test, 'http://nature.com/nplants/')

}, function(error, results) {
	if (error) {
		return console.error(error.message);
	}
	console.log('The title of the Nature home page is: ' + results.home);
	console.log('The title of the Nature Plants home page is: ' + results.plants);
});
