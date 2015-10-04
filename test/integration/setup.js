// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var startMockWebsite = require('./mock/website');

before(function(done) {
	var self = this;
	startMockWebsite(function(error, website) {
		self.website = website;
		done(error);
	});
});
