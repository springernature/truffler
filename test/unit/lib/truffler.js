// jshint maxstatements: false
// jscs:disable disallowMultipleVarDecl, maximumLineLength
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/truffler', function() {
	var extend, freeport, hasbin, phantom, pkg, truffler;

	beforeEach(function() {

		extend = sinon.spy(require('node.extend'));
		mockery.registerMock('node.extend', extend);

		freeport = require('../mock/freeport');
		mockery.registerMock('freeport', freeport);

		hasbin = require('../mock/hasbin');
		mockery.registerMock('hasbin', hasbin);

		phantom = require('../mock/node-phantom-simple');
		mockery.registerMock('node-phantom-simple', phantom);

		pkg = require('../../../package.json');

		truffler = require('../../../lib/truffler');

	});

	it('should be a function', function() {
		assert.isFunction(truffler);
	});

	describe('.defaults', function() {
		var defaults;

		beforeEach(function() {
			defaults = truffler.defaults;
		});

		it('should have a `log` property', function() {
			assert.isObject(defaults.log);
		});

		it('should have a `log.debug` method', function() {
			assert.isFunction(defaults.log.debug);
		});

		it('should have a `log.error` method', function() {
			assert.isFunction(defaults.log.error);
		});

		it('should have a `log.info` method', function() {
			assert.isFunction(defaults.log.info);
		});

		it('should have a `page` property', function() {
			assert.isObject(defaults.page);
		});

		it('should have a `page.headers` property', function() {
			assert.isObject(defaults.page.headers);
		});

		it('should have a `page.settings` property', function() {
			assert.isObject(defaults.page.settings);
		});

		it('should have a `page.settings.resourceTimeout` property', function() {
			assert.strictEqual(defaults.page.settings.resourceTimeout, 30000);
		});

		it('should have a `page.settings.userAgent` property', function() {
			assert.strictEqual(defaults.page.settings.userAgent, 'truffler/' + pkg.version);
		});

		it('should have a `page.viewport` property', function() {
			assert.isObject(defaults.page.viewport);
		});

		it('should have a `page.viewport.width` property', function() {
			assert.strictEqual(defaults.page.viewport.width, 1024);
		});

		it('should have a `page.viewport.width` property', function() {
			assert.strictEqual(defaults.page.viewport.height, 768);
		});

		it('should have a `phantom` property', function() {
			assert.isObject(defaults.phantom);
		});

		it('should have a `timeout` property', function() {
			assert.strictEqual(defaults.timeout, 30000);
		});

	});

	describe('.truffler(testFunction)', function() {
		var instance, testFunction;

		beforeEach(function() {
			testFunction = sinon.spy();
			instance = truffler(testFunction);
		});

		it('should return a Truffler instance', function() {
			assert.isObject(instance);
		});

		describe('returned instance', function() {

			it('should have an `options` property which matches the defaults', function() {
				assert.isObject(instance.options);
				assert.notStrictEqual(instance.options, truffler.defaults);
				assert.deepEqual(instance.options, truffler.defaults);
			});

			it('should have a `testFunction` property set to the passed in function', function() {
				assert.isFunction(instance.testFunction);
				assert.strictEqual(instance.testFunction, testFunction);
			});

		});

	});

	describe('.truffler(options, testFunction)', function() {
		var instance, options, testFunction;

		beforeEach(function() {
			options = {
				foo: 'bar'
			};
			testFunction = sinon.spy();
			instance = truffler(options, testFunction);
		});

		it('should return a Truffler instance', function() {
			assert.isObject(instance);
		});

		it('should default the options', function() {
			assert.calledOnce(extend);
			assert.isTrue(extend.firstCall.args[0]);
			assert.isObject(extend.firstCall.args[1]);
			assert.strictEqual(extend.firstCall.args[2], truffler.defaults);
			assert.strictEqual(extend.firstCall.args[3], options);
		});

		it('should check for presence of PhantomJS binary', function() {
			assert.calledOnce(hasbin.some.sync);
			assert.calledWith(hasbin.some.sync, ['phantomjs', 'phantomjs.exe']);
		});

		it('should throw if PhantomJS is not found', function() {
			hasbin.some.sync.returns(false);
			assert.throws(function() {
				truffler();
			}, 'PhantomJS binary was not found in PATH');
		});

		describe('returned instance', function() {

			it('should have an `options` property which matches the user options merged with defaults', function() {
				assert.isObject(instance.options);
				assert.notStrictEqual(instance.options, options);
				assert.notStrictEqual(instance.options, truffler.defaults);
				assert.strictEqual(instance.options, extend.firstCall.returnValue);
			});

			it('should have a `testFunction` property set to the passed in function', function() {
				assert.isFunction(instance.testFunction);
				assert.strictEqual(instance.testFunction, testFunction);
			});

		});

	});

	describe('Truffler instance', function() {
		var instance;

		beforeEach(function() {
			instance = truffler();
			instance.options = {};
			instance.testFunction = sinon.stub().yieldsAsync(null);
		});

		it('should have a `run` method', function() {
			assert.isFunction(instance.run);
		});

		describe('.run(url, options, done)', function() {
			var done, options, url;

			beforeEach(function() {
				url = 'foo';
				options = {
					foo: 'bar'
				};
				done = sinon.spy();
				instance._run = sinon.stub();
				instance.run(url, options, done);
			});

			it('should call the `_run` method with the passed in arguments', function() {
				assert.calledOnce(instance._run);
				assert.calledWithExactly(instance._run, url, options, done);
			});

		});

		describe('.run(url, done)', function() {
			var done, url;

			beforeEach(function() {
				url = 'foo';
				done = sinon.spy();
				instance._run = sinon.stub();
				instance.run(url, done);
			});

			it('should call the `_run` method with the URL, an empty options object, and the callback', function() {
				assert.calledOnce(instance._run);
				assert.strictEqual(instance._run.firstCall.args[0], url);
				assert.deepEqual(instance._run.firstCall.args[1], {});
				assert.strictEqual(instance._run.firstCall.args[2], done);
			});

		});

		describe('.run(options, done)', function() {
			var done, options;

			beforeEach(function() {
				options = {
					foo: 'bar',
					url: 'foo'
				};
				done = sinon.spy();
				instance._run = sinon.stub();
				instance.run(options, done);
			});

			it('should call the `_run` method with `options.url`, the options (minus URL), and the callback', function() {
				assert.calledOnce(instance._run);
				assert.strictEqual(instance._run.firstCall.args[0], options.url);
				assert.deepEqual(instance._run.firstCall.args[1], options);
				assert.strictEqual(instance._run.firstCall.args[2], done);
			});

		});

		it('should have a `_run` method', function() {
			assert.isFunction(instance._run);
		});

		describe('._run(url, options, done)', function() {
			var expectedResult, options, runResult, url;

			beforeEach(function(done) {
				url = 'http://foo';
				options = {
					foo: 'bar',
					log: {
						debug: sinon.spy(),
						error: sinon.spy(),
						info: sinon.spy()
					},
					page: {
						headers: {
							Foo: 'bar',
							Bar: 'baz'
						},
						settings: {
							baz: 'qux',
							qux: 'foo'
						},
						viewport: {
							width: 1234,
							height: 5678
						}
					},
					phantom: {
						port: 1234,
						bar: 'baz'
					}
				};
				expectedResult = {
					ok: true
				};
				extend.reset();
				instance.sanitizeUrl = sinon.stub().returnsArg(0);
				instance.testFunction.yieldsAsync(null, expectedResult);
				instance._run(url, options, function(error, result) {
					runResult = result;
					done();
				});
			});

			it('should sanitize the URL', function() {
				assert.calledOnce(instance.sanitizeUrl);
				assert.calledWithExactly(instance.sanitizeUrl, url);
			});

			it('should default the options against the instance options', function() {
				assert.calledOnce(extend);
				assert.isTrue(extend.firstCall.args[0]);
				assert.isObject(extend.firstCall.args[1]);
				assert.strictEqual(extend.firstCall.args[2], instance.options);
				assert.strictEqual(extend.firstCall.args[3], options);
			});

			it('should create a PhantomJS browser with the defaulted options', function() {
				assert.calledOnce(phantom.create);
				assert.calledWith(phantom.create, extend.firstCall.returnValue.phantom);
				assert.isFunction(phantom.create.firstCall.args[1]);
			});

			it('should not randomize the PhantomJS port if one is specified', function() {
				assert.notCalled(freeport);
				assert.strictEqual(phantom.create.firstCall.args[0].port, options.phantom.port);
			});

			it('should randomize the PhantomJS port if one is not specified', function(done) {
				options.phantom.port = null;
				freeport.yieldsAsync(null, 5678);
				phantom.create.reset();
				instance._run(url, options, function() {
					assert.calledOnce(freeport);
					assert.strictEqual(phantom.create.firstCall.args[0].port, 5678);
					done();
				});
			});

			it('should log the creation of the PhantomJS browser', function() {
				assert.calledWith(options.log.info, 'PhantomJS browser created');
			});

			it('should callback with an error if the PhantomJS browser creation fails', function(done) {
				var expectedError = new Error('...');
				phantom.create.yieldsAsync(expectedError);
				instance._run(url, options, function(error) {
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should callback with an error if the port randomization fails', function(done) {
				var expectedError = new Error('...');
				options.phantom.port = null;
				freeport.yieldsAsync(expectedError);
				instance._run(url, options, function(error) {
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should create a PhantomJS page in the browser', function() {
				assert.calledOnce(phantom.mockBrowser.createPage);
				assert.isFunction(phantom.mockBrowser.createPage.firstCall.args[0]);
			});

			it('should log the creation of the PhantomJS page', function() {
				assert.calledWith(options.log.debug, 'PhantomJS page created');
			});

			it('should callback with an error if the PhantomJS page creation fails', function(done) {
				var expectedError = new Error('...');
				phantom.mockBrowser.createPage.yieldsAsync(expectedError);
				instance._run(url, options, function(error) {
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should apply custom headers to the PhantomJS page', function() {
				assert.calledWith(phantom.mockPage.set, 'customHeaders', options.page.headers);
			});

			it('should apply each of the page settings to the PhantomJS page', function() {
				assert.calledWith(phantom.mockPage.set, 'settings.baz', 'qux');
				assert.calledWith(phantom.mockPage.set, 'settings.qux', 'foo');
			});

			it('should apply the viewport size to the PhantomJS page', function() {
				assert.calledWith(phantom.mockPage.set, 'viewportSize', options.page.viewport);
			});

			it('should open the given URL in the PhantomJS page', function() {
				assert.calledOnce(phantom.mockPage.open);
				assert.calledWith(phantom.mockPage.open, url);
				assert.isFunction(phantom.mockPage.open.firstCall.args[1]);
			});

			it('should log that the URL is being opened', function() {
				assert.calledWith(options.log.debug, 'Opening "' + url + '" in PhantomJS');
			});

			it('should log that the URL was opened', function() {
				assert.calledWith(options.log.debug, 'Opened "' + url + '" in PhantomJS');
			});

			it('should callback with an error if the PhantomJS page open fails', function(done) {
				var expectedError = new Error('...');
				phantom.mockPage.open.yieldsAsync(expectedError);
				instance._run(url, options, function(error) {
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should callback with an error if the PhantomJS page status is not "success"', function(done) {
				phantom.mockPage.open.yieldsAsync(null, 'fail');
				instance._run(url, options, function(error) {
					assert.instanceOf(error, Error);
					assert.strictEqual(error.message, 'Page "' + url + '" could not be opened');
					done();
				});
			});

			it('should run the instance test function, passing in the PhantomJS browser and page', function() {
				assert.calledOnce(instance.testFunction);
				assert.calledWith(instance.testFunction, phantom.mockBrowser, phantom.mockPage);
				assert.isFunction(instance.testFunction.firstCall.args[2]);
			});

			it('should log that the test function is being run', function() {
				assert.calledWith(options.log.info, 'Testing the page "' + url + '"');
			});

			it('should log that the test function ran', function() {
				assert.calledWith(options.log.debug, 'Test function ran for "' + url + '"');
			});

			it('should callback with an error if the test function errors', function(done) {
				var expectedError = new Error('...');
				instance.testFunction.yieldsAsync(expectedError);
				instance._run(url, options, function(error) {
					assert.strictEqual(error, expectedError);
					done();
				});
			});

			it('should log that the test function errored if the test function errors', function(done) {
				var expectedError = new Error('...');
				instance.testFunction.yieldsAsync(expectedError);
				instance._run(url, options, function() {
					assert.calledWith(options.log.error, 'Test function errored for "' + url + '"');
					done();
				});
			});

			it('should close the PhantomJS page', function() {
				assert.calledOnce(phantom.mockPage.close);
			});

			it('should exit the PhantomJS browser', function() {
				assert.calledOnce(phantom.mockBrowser.exit);
			});

			it('should log that the PhantomJS browser exited', function() {
				assert.calledWith(options.log.debug, 'PhantomJS browser exited');
			});

			it('should callback with the result of the test function', function() {
				assert.strictEqual(runResult, expectedResult);
			});

			it('should run everything in the correct order', function() {
				assert.callOrder(
					phantom.create,
					phantom.mockBrowser.createPage,
					phantom.mockPage.open,
					instance.testFunction
				);
			});

			it('should error if the process times out', function(done) {
				var clock = sinon.useFakeTimers();
				options.timeout = 100;
				phantom.create = function(options, callback) {
					clock.tick(101);
					callback(null, phantom.mockBrowser);
				};
				instance._run(url, options, function(error) {
					clock.restore();
					assert.instanceOf(error, Error);
					assert.strictEqual(error.message, 'Truffler timed out (100ms)');
					done();
				});
			});

		});

		it('should have a `sanitizeUrl` method', function() {
			assert.isFunction(instance.sanitizeUrl);
		});

		describe('.sanitizeUrl(url)', function() {

			it('should return the passed in URL if it doesn\'t need sanitizing', function() {
				assert.strictEqual(instance.sanitizeUrl('http://foo'), 'http://foo');
				assert.strictEqual(instance.sanitizeUrl('https://foo'), 'https://foo');
			});

			it('should add an "http" scheme if one is not present', function() {
				assert.strictEqual(instance.sanitizeUrl('foo'), 'http://foo');
			});

			it('should trim the URL', function() {
				assert.strictEqual(instance.sanitizeUrl('  foo  '), 'http://foo');
			});

		});

	});

});
