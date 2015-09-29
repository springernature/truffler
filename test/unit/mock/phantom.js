'use strict';

var sinon = require('sinon');

var phantom = module.exports = {
	create: sinon.stub(),
	mockBrowser: {
		addCookie: sinon.stub(),
		createPage: sinon.stub(),
		exit: sinon.stub()
	},
	mockPage: {
		open: sinon.stub(),
		set: sinon.stub()
	}
};

phantom.create.yieldsAsync(null, phantom.mockBrowser);
phantom.mockBrowser.createPage.yieldsAsync(null, phantom.mockPage);
phantom.mockPage.open.yieldsAsync(null, 'success');
