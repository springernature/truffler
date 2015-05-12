/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');

describe('lib/truffler', function () {
	var truffler;

	beforeEach(function () {
		truffler = require('../../../lib/truffler');
	});

	it('should be a function', function () {
		assert.isFunction(truffler);
	});

});
