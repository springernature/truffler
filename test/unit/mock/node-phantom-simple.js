'use strict';

var sinon = require('sinon');

var phantom = module.exports = {
	create: sinon.stub(),
	mockBrowser: {
		createPage: sinon.stub(),
		exit: sinon.stub()
	},
	mockPage: {
		close: sinon.stub(),
		open: sinon.stub(),
		set: sinon.stub().yieldsAsync()
	}
};

phantom.create.yieldsAsync(null, phantom.mockBrowser);
phantom.mockBrowser.createPage.yieldsAsync(null, phantom.mockPage);
phantom.mockPage.open.yieldsAsync(null, 'success');
