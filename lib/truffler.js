'use strict';

var extend = require('node.extend');
var pkg = require('../package.json');

module.exports = truffler;
module.exports.defaults = {
	page: {
		cookies: [],
		settings: {},
		viewport: {
			width: 1024,
			height: 768
		}
	},
	phantom: {
		port: 12300
	},
	useragent: 'truffler/' + pkg.version
};

function truffler (options, done) {
	options = defaultOptions(options);
	done(null, function () {});
}

function defaultOptions (options) {
	return extend(true, {}, module.exports.defaults, options);
}
