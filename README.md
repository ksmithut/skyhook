# skyhook

[![io.js compatibility](https://img.shields.io/badge/io.js-compatible-brightgreen.svg?style=flat)](https://iojs.org/)
[![node.js compatibility](https://img.shields.io/badge/node.js-compatible-brightgreen.svg?style=flat)](https://nodejs.org/)

[![NPM version](http://img.shields.io/npm/v/skyhook.svg?style=flat)](https://www.npmjs.org/package/skyhook)
[![Dependency Status](http://img.shields.io/david/ksmithut/skyhook.svg?style=flat)](https://david-dm.org/ksmithut/skyhook)
[![Dev Dependency Status](http://img.shields.io/david/dev/ksmithut/skyhook.svg?style=flat)](https://david-dm.org/ksmithut/skyhook#info=devDependencies&view=table)
[![Code Climate](http://img.shields.io/codeclimate/github/ksmithut/skyhook.svg?style=flat)](https://codeclimate.com/github/ksmithut/skyhook)
[![Build Status](http://img.shields.io/travis/ksmithut/skyhook/master.svg?style=flat)](https://travis-ci.org/ksmithut/skyhook)
[![Coverage Status](http://img.shields.io/codeclimate/coverage/github/ksmithut/skyhook.svg?style=flat)](https://codeclimate.com/github/ksmithut/skyhook)

A Promise-based pub sub hub hook system for node.

# Installation

```bash
npm install --save skyhook
```

# Usage

```js
// Normal example
var hooks = require('skyhook')();

hooks.register('init', function () {
  console.log('initializing');
});

hooks.trigger('init').then(function () {
  console.log('initialized');
  // console.logs the following:
  // initializing
  // initialized
});

// Real World example
var express = require('express');

hooks.register('middleware', function (app) {
  app.get('/user', function (req, res, next) {
    res.json({
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });
  });
}, {once: true, weight: 1});

hooks.register('middleware', function (app) {
  app.use(express.static(__dirname + '/public'));
}, {once: true});

hooks.trigger('middleware', express()).then(function (app) {
  app.listen(8000);
});
```

# Options

## Constructor options

Below are the default options passed to the constructor.

```js
var Skyhook = require('skyhook');
// You don't need the `new` keyword. It will create a new instance for you.
var hooks = new Skyhook({
  Promise: require('bluebird') // You can override the Promise implementation.
});
```

## `.register()` options

The first parameter is the name of the hook you want to register to. The second
is the method you want called. If you want to bind a specific context, you'll
need to bind it manually with `.bind()`. It's only argument is the object that
the hook was triggered with. If the argument is an object, any changes you make
to the properties of the object will persist to the next call. If you get a
string, a number, or other value that is passed by reference, then you must
return the modified value if you wish your changes to be persisted.

This is chainable with multiple registers.

```js
hooks.trigger('init', function () {}, {
  weight: 0, // Orders the hook methods in order of weight, smallest number going first
  once: false // Will only call the hook method once, no matter how many times the hook is called
});
```

## `.trigger()` options

The first parameter is the name of the hook you wish to call. The second is
options, but if you wish to expose any config object you wish to be exposed to
other hooks, this is where you would put it. Note that it only accepts 1
parameter. This is to simplify your hooks. If you wish to expose more than one
parameter to be changed, just create another hook.

This method returns a promise with resolves to the modified (or un-modified)
value that you passed (or didn't pass).

## `.triggerMultiple()` options

`triggerMultiple` is the same as `.trigger()`, but the first argument accepts
an array of hooks you want to call. The second parameter works like before, and
it gets passed through all of the arguments passed.

# Questions/Comments

PRs/Issues welcome!

# License

MIT (see [LICENCE](LICENCE))
