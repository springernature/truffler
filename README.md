
Truffler
========

Access web pages programmatically with [PhantomJS][phantom], for running tests or scraping information.

[![NPM version][shield-npm]][info-npm]
[![Node.js version support][shield-node]][info-node]
[![Build status][shield-build]][info-build]
[![Dependencies][shield-dependencies]][info-dependencies]
[![MIT licensed][shield-license]][info-license]

```js
var truffler = require('truffler');

var test = truffler(function(browser, page, done) {
    // the test function to run in PhantomJS
    done();
});

test.run('http://www.nature.com/', function(error, results) {
    console.log(results);
});
```


Table Of Contents
-----------------

- [Install](#install)
- [Usage](#usage)
- [Options](#options)
- [Examples](#examples)
- [Contributing](#contributing)
- [Support and Migration](#support-and-migration)
- [License](#license)


Install
-------

Install Truffler with [npm][npm]:

```sh
npm install truffler
```


Usage
-----

Require in Truffler:

```js
var truffler = require('truffler');
```

Create a test runner by initialising Truffler with a test function. This test function has access to a PhantomJS [browser][phantom-browser] and [page][phantom-page] instance. The test function must accept a third argument which is a callback:

```js
var test = truffler(function(browser, page, done) {
    // ... perform testing here ...
    done(error, results);
});
```

Within this function, you have access to all of the behaviour in PhantomJS.

You can also instantiate Truffler with some [default options](#options) if you wish. This allows you to change the way PhantomJS and your page is loaded:

```js
var test = truffler({
    // ... options go here ...
}, function(browser, page, done) {
    // ... perform testing here ...
});
```

The `test.run` function can then be used to run your test function against a URL:

```js
test.run('http://www.nature.com/', function(error, results) {
    // ...
});
```

The `error` and `results` parameters contain errors and results from the PhantomJS run against your page. The results can be any object you like. Here's an example test function which returns the page title if it has one, or errors if not.

```js
var test = truffler(function(browser, page, done) {
    page.evaluate(
        function() {
            return document.title;
        },
        function(error, title) {
            if (!title) {
                return done(new Error('The page has no title!'));
            }
            done(null, title);
        }
    );
});

test.run('http://www.nature.com/', function(error, title) {
    // ... do something with the error and title ...
});
```


Options
-------

Truffler has lots of options you can use to change the way PhantomJS runs, or the way your page is loaded. Options can be set either on the Truffler instance when it's created or the individual test runs. This allows you to set some defaults which can be overridden per-test:

```js
// Set the default Foo header to "bar"
var test = truffler({
    page: {
        headers: {
            Foo: 'bar'
        }
    }
}, function() { /* ... */ });

// Run a test with the Foo header set to "bar"
test.run('http://www.nature.com/', function(error, title) { /* ... */});

// Run a test with the Foo header overridden
test.run('http://www.nature.com/', {
    page: {
        headers: {
            Foo: 'hello'
        }
    }
}, function(error, title) { /* ... */});
```

Below is a reference of all the options that are available:

### `log` (object)

An object which implments the methods `debug`, `error`, and `info` which will be used to report errors and test information.

```js
truffler({
    log: {
        debug: console.log.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console)
    }
});
```

Each of these defaults to an empty function.

### `page.headers` (object)

A key-value map of request headers to send when testing a web page.

```js
truffler({
    page: {
        headers: {
            Cookie: 'foo=bar'
        }
    }
});
```

Defaults to an empty object.

### `page.settings` (object)

A key-value map of settings to add to the PhantomJS page. For a full list of available settings, see the [PhantomJS page settings documentation][phantom-page-settings].

```js
truffler({
    page: {
        settings: {
            loadImages: false,
            userName: 'nature',
            password: 'say the magic word'
        }
    }
});
```

Defaults to:

```js
{
    resourceTimeout: 30000,
    userAgent: 'truffler/<version>'
}
```

### `page.viewport` (object)

The viewport width and height in pixels. The `viewport` object must have both `width` and `height` properties.

```js
truffler({
    page: {
        viewport: {
            width: 320,
            height: 480
        }
    }
});
```

Defaults to:

```js
{
    width: 1024,
    height: 768
}
```

### `phantom` (object)

A key-value map of settings to initialise PhantomJS with. This is passed directly into the `phantom` module – [documentation can be found here][phantom-node-options]. You can pass PhantomJS command-line parameters in the `phantom.parameters` option as key-value pairs.

```js
truffler({
    phantom: {
        path: 'PATH_TO_PHANTOMJS_EXE',
        port: 1234,
        parameters: {
            'ignore-ssl-errors': 'true'
        }
    }
});
```

Defaults to an empty object. If `phantom.port` is not specified, a random available port will be used.

### `timeout` (number)

The maximum time (in milliseconds) that Truffler should run for. This timeout can sometimes be exceeded, if a long-running task has started within PhantomJS itself. This is rare, but you shouldn't rely on exact timing.

If the timeout is exceeded, the test function will callback with an error and no results.

```js
truffler({
    timeout: 1000
});
```

Defaults to `30000` (30 seconds).


Examples
--------

### Basic Example

Run Truffler on a URL and output the page title:

```
node example/basic
```

### Multiple Example

Use [async][async] to run Truffler on multiple URLs in series, and output the page titles:

```
node example/multiple
```


Contributing
------------

To contribute to Truffler, clone this repo locally and commit your code on a separate branch.

Please write unit tests for your code, and check that everything works by running the following before opening a pull-request:

```sh
make ci
```


Support and Migration
---------------------

Truffler major versions are normally supported for 6 months after their last minor release. This means that patch-level changes will be added and bugs will be fixed. The table below outlines the end-of-support dates for major versions, and the last minor release for that version.

We also maintain a [migration guide](MIGRATION.md) to help you migrate.

| :grey_question: | Major Version | Last Minor Release | Node.js Versions | Support End Date |
| :-------------- | :------------ | :----------------- | :--------------- | :--------------- |
| :heart:         | 2             | N/A                | 0.12+            | N/A              |
| :hourglass:     | 1             | 1.0                | 0.10–4           | 2016-10-16       |

If you're opening issues related to these, please mention the version that the issue relates to.


License
-------

Truffler is licensed under the [MIT][info-license] license.  
Copyright &copy; 2015, Springer Nature



[1.x]: https://github.com/springernature/truffler/tree/1.x
[async]: https://github.com/caolan/async
[npm]: https://npmjs.org/
[phantom]: http://phantomjs.org/
[phantom-browser]: http://phantomjs.org/api/phantom/
[phantom-node-options]: https://github.com/sgentle/phantomjs-node#functionality-details
[phantom-page]: http://phantomjs.org/api/webpage/
[phantom-page-settings]: http://phantomjs.org/api/webpage/property/settings.html

[info-dependencies]: https://gemnasium.com/springernature/truffler
[info-license]: LICENSE
[info-node]: package.json
[info-npm]: https://www.npmjs.com/package/truffler
[info-build]: https://travis-ci.org/springernature/truffler
[shield-dependencies]: https://img.shields.io/gemnasium/springernature/truffler.svg
[shield-license]: https://img.shields.io/badge/license-MIT-blue.svg
[shield-node]: https://img.shields.io/badge/node.js%20support-0.12–6-brightgreen.svg
[shield-npm]: https://img.shields.io/npm/v/truffler.svg
[shield-build]: https://img.shields.io/travis/springernature/truffler/master.svg
