'use strict';

var fs = require('fs');
var http = require('http');
var parseUrl = require('url').parse;

module.exports = startMockWebsite;

function startMockWebsite(done) {
	var routes = {

		'/basic': function(request, response) {
			response.end(fs.readFileSync(__dirname + '/basic.html'));
		},

		'/headers': function(request, response) {
			var headers = Object.keys(request.headers).map(function(header) {
				return header + ': ' + request.headers[header];
			});
			response.end(headers.join('\n'));
		},

		'/timeout': function(request, response) {
			setTimeout(function() {
				response.end('timeout');
			}, 10000);
		},

		default: function(request, response) {
			response.writeHead(404);
			response.end('not found');
		}

	};
	var website = http.createServer(function(request, response) {
		var url = parseUrl(request.url).pathname;
		(routes[url] || routes.default)(request, response);
	});
	website.listen(function(error) {
		website.url = 'http://localhost:' + website.address().port;
		done(error, website);
	});
}
