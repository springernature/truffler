'use strict';

var extend = require('node.extend');
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
		cookies: [],
		settings: {
			userAgent: 'truffler/' + pkg.version
		},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {
		port: 12300
	},
	testFunction: function (browser, page, done) {
		done(null, null);
	}
};

function truffler (options, completeSetup) {
	options = defaultOptions(options);
	phantom.create(function (browser) {
		options.log.info('PhantomJS browser created');
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
				options.page.cookies.forEach(page.addCookie.bind(page));
				page.open(url, function (status) {
					if (status !== 'success') {
						options.log.error('PhantomJS failed to open "' + url + '"');
						return completeTest(new Error('Page "' + url + '" could not be loaded'));
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
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}
