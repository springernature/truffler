'use strict';

var async = require('async');
var extend = require('node.extend');
var freeport = require('freeport');
var hasbin = require('hasbin');
var phantom = require('node-phantom-simple');
var pkg = require('../package.json');

module.exports = truffler;
module.exports.defaults = {
	log: {
		debug: /* istanbul ignore next */ function() {},
		error: /* istanbul ignore next */ function() {},
		info: /* istanbul ignore next */ function() {}
	},
	page: {
		headers: {},
		settings: {
			resourceTimeout: 30000,
			userAgent: 'truffler/' + pkg.version
		},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {},
	timeout: 30000
};

function truffler(options, testFunction) {
	return new Truffler(options, testFunction);
}

function Truffler(options, testFunction) {
	if (typeof options === 'function') {
		testFunction = options;
		options = {};
	}
	if (!((options && options.phantom && options.phantom.path) || isPhantomInstalled())) {
		throw new Error('PhantomJS binary was not found in PATH');
	}
	this.options = defaultOptions(module.exports.defaults, options);
	this.testFunction = testFunction;
}

Truffler.prototype.run = function(url, options, done) {
	done = arguments[arguments.length - 1];
	if (arguments.length === 2 && typeof url === 'string') {
		options = {};
	}
	if (arguments.length === 2 && typeof url !== 'string') {
		options = url;
		url = options.url;
	}
	this._run(url, options, done);
};

Truffler.prototype._run = function(url, options, done) {
	var state = {};
	state.testFunction = this.testFunction;
	url = this.sanitizeUrl(url);
	options = defaultOptions(this.options, options);

	// Start the timeout timer
	state.timer = setTimeout(function() {
		state.timeout = true;
	}, options.timeout);

	// Wrap functions to ensure timeout errors block further execution
	function guardAgainstTimeout(functionToGuard) {
		return function(next) {
			if (state.timeout) {
				return next(new Error('Truffler timed out (' + options.timeout + 'ms)'));
			}
			functionToGuard(next);
		};
	}

	// Start the testing
	async.series({

		// Randomize the port if one is not set
		randomizePort: guardAgainstTimeout(function(next) {
			if (options.phantom.port) {
				return next();
			}
			freeport(function(error, port) {
				if (error) {
					return next(error);
				}
				options.phantom.port = port;
				next();
			});
		}),

		// Create a PhantomJS browser
		createBrowser: guardAgainstTimeout(function(next) {
			phantom.create(options.phantom, function(error, browser) {
				if (error) {
					return next(error);
				}
				options.log.info('PhantomJS browser created');
				state.browser = browser;
				next();
			});
		}),

		// Create a PhantomJS page
		createPage: guardAgainstTimeout(function(next) {
			state.browser.createPage(function(error, page) {
				if (error) {
					return next(error);
				}
				options.log.debug('PhantomJS page created');
				state.page = page;
				next();
			});
		}),

		// Apply page headers
		applyPageHeaders: guardAgainstTimeout(function(next) {
			state.page.set('customHeaders', options.page.headers, next);
		}),

		// Apply page settings
		applyPageSettings: guardAgainstTimeout(function(next) {
			var settings = options.page.settings;
			var settingFunctions = Object.keys(settings).map(function(setting) {
				return state.page.set.bind(state.page, 'settings.' + setting, settings[setting]);
			});
			async.parallel(settingFunctions, next);
		}),

		// Apply page viewport size
		applyPageViewport: guardAgainstTimeout(function(next) {
			state.page.set('viewportSize', options.page.viewport, next);
		}),

		// Open the URL in PhantomJS
		openUrl: guardAgainstTimeout(function(next) {
			options.log.debug('Opening "' + url + '" in PhantomJS');
			state.page.open(url, function(error, status) {
				if (error) {
					return next(error);
				}
				if (status !== 'success') {
					return next(new Error('Page "' + url + '" could not be opened'));
				}
				options.log.debug('Opened "' + url + '" in PhantomJS');
				next();
			});
		}),

		// Run the test function
		runTestFunction: guardAgainstTimeout(function(next) {
			options.log.info('Testing the page "' + url + '"');
			state.testFunction(state.browser, state.page, function(error, result) {
				if (error) {
					options.log.error('Test function errored for "' + url + '"');
					return next(error);
				}
				options.log.debug('Test function ran for "' + url + '"');
				next(null, result);
			});
		})

	}, function(error, result) {
		clearTimeout(state.timer);
		if (state.page) {
			options.log.debug('PhantomJS page closed');
			state.page.close();
			state.page = null;
		}
		if (state.browser) {
			options.log.debug('PhantomJS browser exited');
			state.browser.exit();
			state.browser = null;
		}
		if (error) {
			return done(error);
		}
		done(null, result.runTestFunction);
	});
};

Truffler.prototype.sanitizeUrl = function(url) {
	url = url.trim();
	if (!/^[a-z]+:\/\//i.test(url)) {
		url = 'http://' + url;
	}
	return url;
};

function isPhantomInstalled() {
	return hasbin.some.sync(['phantomjs', 'phantomjs.exe']);
}

function defaultOptions(defaults, options) {
	return extend(true, {}, defaults, options);
}
