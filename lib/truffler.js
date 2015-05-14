'use strict';

var extend = require('node.extend');
var hasbin = require('hasbin');
var phantom = require('phantom');
var pkg = require('../package.json');

module.exports = truffler;
module.exports.defaults = {
	log: {
		debug: function () {},
		error: function () {},
		info: function () {}
	},
	page: {
		settings: {
			userAgent: 'truffler/' + pkg.version
		},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {
		cookies: [],
		port: 12300
	},
	testFunction: function (browser, page, done) {
		done(null, null);
	}
};

function truffler (options, completeSetup) {
	options = defaultOptions(options);
	hasbin.some(['phantomjs', 'phantomjs.exe'], function (hasPhantom) {
		if (!hasPhantom) {
			var error = new Error('PhantomJS binary was not found in PATH');
			return completeSetup(error);
		}
		phantom.create(function (browser) {
			options.log.info('PhantomJS browser created');
			options.phantom.cookies.forEach(browser.addCookie.bind(browser));
			completeSetup(null, test, exit);

			function test (url, completeTest) {
				if (!/[a-z]+:\/\//i.test(url)) {
					url = 'http://' + url;
				}
				options.log.info('Testing page: "' + url + '"');
				browser.createPage(function (page) {
					options.log.debug('PhantomJS page created for "' + url + '"');
					Object.keys(options.page.settings).forEach(function (setting) {
						page.set('settings.' + setting, options.page.settings[setting]);
					});
					page.set('viewportSize', options.page.viewport);
					page.open(url, function (status) {
						if (status !== 'success') {
							var error = new Error('Page "' + url + '" could not be loaded');
							options.log.error('PhantomJS failed to open "' + url + '"');
							return completeTest(error);
						}
						options.log.debug('PhantomJS page for "' + url + '" opened');
						options.testFunction(browser, page, function (error, result) {
							if (error) {
								options.log.error('Test function errored for "' + url + '"');
							} else {
								options.log.debug('Test function ran for "' + url + '"');
							}
							completeTest(error, result);
						});
					});
				});
			}

			function exit () {
				browser.exit();
			}

		}, options.phantom);
	});
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}
