/* jshint maxstatements: false, maxlen: false */
/* global beforeEach, describe, it */
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/truffler', function () {
	var extend, pkg, truffler;

	beforeEach(function () {

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		pkg = require('../../../package.json');

		truffler = require('../../../lib/truffler');

	});

	it('should be a function', function () {
		assert.isFunction(truffler);
	});

	describe('.defaults', function () {
		var defaults;

		beforeEach(function () {
			defaults = truffler.defaults;
		});

		it('should have a `page` property', function () {
			assert.isObject(defaults.page);
		});

		it('should have a `page.cookies` property', function () {
			assert.isArray(defaults.page.cookies);
		});

		it('should have a `page.settings` property', function () {
			assert.isObject(defaults.page.settings);
		});

		it('should have a `page.viewport` property', function () {
			assert.isObject(defaults.page.viewport);
		});

		it('should have a `page.viewport.width` property', function () {
			assert.strictEqual(defaults.page.viewport.width, 1024);
		});

		it('should have a `page.viewport.width` property', function () {
			assert.strictEqual(defaults.page.viewport.height, 768);
		});

		it('should have a `phantom` property', function () {
			assert.isObject(defaults.phantom);
		});

		it('should have a `phantom.port` property', function () {
			assert.strictEqual(defaults.phantom.port, 12300);
		});

		it('should have a `useragent` property', function () {
			assert.strictEqual(defaults.useragent, 'truffler/' + pkg.version);
		});

	});

	it('should callback with a function', function (done) {
		truffler({}, function (error, test) {
			assert.isFunction(test);
			done();
		});
	});

	it('should default the options', function (done) {
		var options = {};
		truffler(options, function () {
			assert.calledOnce(extend);
			assert.isTrue(extend.firstCall.args[0]);
			assert.isObject(extend.firstCall.args[1]);
			assert.strictEqual(extend.firstCall.args[2], truffler.defaults);
			assert.strictEqual(extend.firstCall.args[3], options);
			done();
		});
	});

});
