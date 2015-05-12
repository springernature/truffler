'use strict';

var extend = require('node.extend');
var phantom = require('phantom');
var pkg = require('../package.json');

module.exports = truffler;
module.exports.defaults = {
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
		completeSetup(null, test, exit);

		function test (url, completeTest) {
			if (!/[a-z]+:\/\//i.test(url)) {
				url = 'http://' + url;
			}
			browser.createPage(function (page) {
				Object.keys(options.page.settings).forEach(function (setting) {
					page.set('settings.' + setting, options.page.settings[setting]);
				});
				page.set('viewportSize', options.page.viewport);
				page.open(url, function (status) {
					if (status !== 'success') {
						return completeTest(new Error('Page "' + url + '" could not be loaded'));
					}
					options.testFunction(browser, page, completeTest);
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
