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
			userAgent: 'truffler/' + pkg.version
		},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {}
};

function truffler(options, testFunction) {
	return new Truffler(options, testFunction);
}

function Truffler(options, testFunction) {
	if (typeof options === 'function') {
		testFunction = options;
		options = {};
	}
	if (!isPhantomInstalled()) {
		throw new Error('PhantomJS binary was not found in PATH');
	}
	this.options = defaultOptions(module.exports.defaults, options);
	this.testFunction = testFunction;
}

Truffler.prototype.run = function(url, options, done) {
	if (arguments.length === 2 && typeof url === 'string') {
		done = options;
		options = {};
	}
	if (arguments.length === 2 && typeof url !== 'string') {
		done = options;
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
	async.series({

		// Randomize the port if one is not set
		randomizePort: function(next) {
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
		},

		// Create a PhantomJS browser
		createBrowser: function(next) {
			phantom.create(options.phantom, function(error, browser) {
				if (error) {
					return next(error);
				}
				options.log.info('PhantomJS browser created');
				state.browser = browser;
				next();
			});
		},

		// Create a PhantomJS page
		createPage: function(next) {
			state.browser.createPage(function(error, page) {
				if (error) {
					return next(error);
				}
				options.log.debug('PhantomJS page created');
				state.page = page;
				next();
			});
		},

		// Apply page headers
		applyPageHeaders: function(next) {
			state.page.set('customHeaders', options.page.headers, next);
		},

		// Apply page settings
		applyPageSettings: function(next) {
			var settings = options.page.settings;
			var settingFunctions = Object.keys(settings).map(function(setting) {
				return state.page.set.bind(state.page, 'settings.' + setting, settings[setting]);
			});
			async.parallel(settingFunctions, next);
		},

		// Apply page viewport size
		applyPageViewport: function(next) {
			state.page.set('viewportSize', options.page.viewport, next);
		},

		// Open the URL in PhantomJS
		openUrl: function(next) {
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
		},

		// Run the test function
		runTestFunction: function(next) {
			options.log.info('Testing the page "' + url + '"');
			state.testFunction(state.browser, state.page, function(error, result) {
				if (error) {
					options.log.error('Test function errored for "' + url + '"');
					return next(error);
				}
				options.log.debug('Test function ran for "' + url + '"');
				next(null, result);
			});
		}

	}, function(error, result) {
		if (state.browser) {
			options.log.debug('PhantomJS browser exited');
			state.browser.exit();
		}
		delete state.browser;
		delete state.page;
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
