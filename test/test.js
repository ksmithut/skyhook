'use strict';

var expect = require('chai').expect;
var Promise = require('bluebird');
var Hooks = require('../');

describe('Hooks', function () {
  /* jshint maxstatements: false */

  it('should add hooks and call them', function () {
    var hooks = new Hooks();
    var called = false;
    hooks.register('test', function () { called = true; });
    return hooks.trigger('test')
      .then(function () {
        expect(called).to.be.equal(true);
      });
  });

  it('should work without the new keyword', function () {
    /* jshint newcap: false */
    var hooks = Hooks();
    var called = false;
    hooks.register('test', function () { called = true; });
    return hooks.trigger('test')
      .then(function () {
        expect(called).to.be.equal(true);
      });
  });

  it('should not call hooks that weren\'t called', function () {
    var hooks = new Hooks();
    var called = false;
    hooks.register('test', function () { called = true; });
    return hooks.trigger('test1')
      .then(function () {
        expect(called).to.be.equal(false);
      });
  });

  it('should be able to call hooks in their weighted order', function () {
    var hooks = new Hooks();
    var values = [];
    hooks.register('test', function () { values.push(3); }, {weight: 3});
    hooks.register('test', function () { values.push(1); }, {weight: 1});
    hooks.register('test', function () { values.push(2); }, {weight: 2});
    return hooks.trigger('test')
      .then(function () {
        expect(values).to.eql([1, 2, 3]);
      });
  });

  it('should be able to pass arguments through all the hooks', function () {
    var hooks = new Hooks();
    var called = false;
    hooks.register('test', function (val) {
      expect(val).to.be.equal('test');
      called = true;
    });
    return hooks.trigger('test', 'test')
      .then(function () {
        expect(called).to.be.equal(true);
      });
  });

  it('should be able to modify arguments through all the hooks', function () {
    var hooks = new Hooks();
    var called = false;
    hooks.register('test', function (val) {
      val.foo = 'bar';
      called = true;
    });
    hooks.register('test', function (val) {
      val.hello = 'world';
      called = called && true;
    });
    return hooks.trigger('test', {})
      .then(function (obj) {
        expect(obj).to.be.eql({
          foo: 'bar',
          hello: 'world'
        });
        expect(called).to.be.equal(true);
      });
  });

  it('should be able to modify arguments by returning a value', function () {
    var hooks = new Hooks();
    var called = false;
    hooks.register('test', function (val) {
      called = true;
      return val += 'abc';
    });
    hooks.register('test', function (val) {
      expect(val).to.be.equal('abc');
      // no modification
    });
    hooks.register('test', function (val) {
      expect(val).to.be.equal('abc');
      called = called && true;
      return val += '123';
    });
    return hooks.trigger('test', '')
      .then(function (val) {
        expect(val).to.be.equal('abc123');
        expect(called).to.be.equal(true);
      });
  });

  it('should handle async hooks by returning promises', function () {
    var hooks = new Hooks();
    hooks.register('test', function (val) {
      return Promise.resolve(true);
    });
    return hooks.trigger('test', false)
      .then(function (val) {
        expect(val).to.be.equal(true);
      });
  });

  it('should call multiple hooks', function () {
    var hooks = new Hooks();
    hooks.register('post.test', function (values) { values.push(3); });
    hooks.register('pre.test', function (values) { values.push(1); });
    hooks.register('test', function (values) { values.push(2); });
    return hooks.triggerMultiple(['pre.test', 'test', 'post.test'], [])
      .then(function (values) {
        expect(values).to.be.eql([1, 2, 3]);
      });
  });

  it('should call hooks more than once', function () {
    var hooks = new Hooks();
    var count = 0;
    hooks.register('init', function () { count++; });
    return hooks.trigger('init')
      .then(function () {
        expect(count).to.be.equal(1);
        return hooks.trigger('init');
      })
      .then(function () {
        expect(count).to.be.equal(2);
      });
  });

  it('should repect running hook only once', function () {
    var hooks = new Hooks();
    var count = 0;
    hooks.register('init', function () { count++; }, {once: true});
    return hooks.trigger('init')
      .then(function () {
        expect(count).to.be.equal(1);
        return hooks.trigger('init');
      })
      .then(function () {
        expect(count).to.be.equal(1);
      });
  });

});
