
Migration Guide
===============

Truffler's API changes between major versions. This is a guide to help you make the switch when this happens.


Table Of Contents
-----------------

- [Migrating from 2.0 to 3.0](#migrating-from-20-to-30)
- [Migrating from 1.0 to 2.0](#migrating-from-10-to-20)


Migrating from 2.0 to 3.0
-------------------------

### Test function arguments

The test function passed into Truffler now accepts additional arguments – the defaulted options are now passed into it. This allows option overrides outside of Truffler itself.

```js
var test = truffler(function(browser, page, done) {
    // the test function to run in PhantomJS
    done();
});
```

becomes:

```js
var test = truffler(function(browser, page, options, done) {
    // the test function to run in PhantomJS
    done();
});
```

### Node.js Support

Node.js 0.10 and 0.12 are no longer supported. We'll be using newer ES6 features in upcoming releases which will not work in this older Node.js version.


Migrating From 1.0 To 2.0
-------------------------

Version 2.0 brings a few major changes:

### API Overhaul

The Truffler API has been overhauled completely. It would be best to refer to the [usage guide in the README](README.md#usage) as your code will need refactoring.

### Randomized Ports

The `phantom.port` option no longer has a default. If a port is not specified, then Truffler will bind to an available port. This allows for easier running of tests in parallel, as PhantomJS instances will no longer conflict with eachother.

### Change of PhantomJS Bridge

Truffler 2.0 has switched from using [sgentle/phantomjs-node](https://github.com/sgentle/phantomjs-node) to [baudehlo/node-phantom-simple](https://github.com/baudehlo/node-phantom-simple).

The new bridge is much simpler with fewer dependencies, and should allow us to support later versions of Node.js more easily.

This introduces some slight incompatibilities, See the [node-phantom-simple usage guide](https://github.com/baudehlo/node-phantom-simple#usage) for more information.

### Node.js Support

Node.js 0.10 is no longer officially supported. We'll be running tests against it still, but these are marked as "allowed to fail". If you're absolutely reliant on Node.js 0.10, [check the latest build](https://travis-ci.org/springernature/truffler) to verify that it's still working.
