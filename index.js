'use strict';

var assign = require('object-assign');
var bluebird = require('bluebird');

module.exports = Hooks;

// Private keys
// TODO ES2015 Symbols
var _registry = '_registry';

/**
 * @constructor
 * @param {Object} [options]
 * @param {Class} [options.Promise=require('bluebird')] - The Promise
 * implementation to use
 * @return Hooks
 */
function Hooks(options) {
  if (!(this instanceof Hooks)) { return new Hooks(options); }

  options = assign({
    Promise: bluebird
  }, options);

  /**
   * @name Hooks#Promise
   * The Promise implementation that is being used
   */
  this.Promise = options.Promise;
  this[_registry] = {};
}

Hooks.prototype = {
  /**
   * @name Hooks#register
   * Registers a method to a given hook name. The method will be called when
   * the given hook name is called.
   * @param {String} name - The name of the hook
   * @param {Function} method - The method to be called once the hook is called
   * @param {Object} [options]
   * @param {Number} [options.weight=0] - The weight of the method, or the order
   * it is called in, in relation to the other methods tacked onto this hook.
   * @param {Boolean} [options.once=false] - Whether or not to only call the
   * method once, whether or not the hook was called more than once.
   */
  register: function register(name, method, options) {
    options = assign({
      weight: 0,
      once: false
    }, options);

    this[_registry][name] = this[_registry][name] || [];
    this[_registry][name].push({
      once: options.once,
      weight: options.weight,
      method: method
    });

    return this;
  },

  /**
   * @name Hooks#trigger
   * Calls a given hook with the given param
   * @param {String} name - The name of the hook to trigger
   * @param {Mixed} [param] - The parameter to pass along to all of the hooked
   * methods. Each hooked method can change the object by changing properties on
   * the parameter directly or returning a new object.
   * @returns {Promise} Resolves to the parameter value after it has been
   * modified
   */
  trigger: function trigger(name, param) {
    return (this[_registry][name] || [])
      .sort(function (a, b) { return a.weight - b.weight; })
      .reduce(function (promise, hook, i, hooks) {
        return promise
          .then(hook.method)
          .then(function (returnVal) {
            if (hook.once) { hooks.splice(i, 1); }
            param = (typeof returnVal === 'undefined') ? param : returnVal;
            return param;
          });
      }, this.Promise.resolve(param));
  },

  /**
   * @name Hook#triggerMultiple
   * Calls the given hooks with the given param
   * @param {String[]} hookNames - The array of hook names to call.
   * @param {Mixed} [param] - The parameter to pass along to all of the hooked
   * methods.
   * @returns {Promise} Resolves to the paramter value after it has been
   * modified by all of the given hooks.
   */
  triggerMultiple: function triggerMultiple(hookNames, param) {
    var trigger = this.trigger.bind(this);
    return hookNames.reduce(function (promise, hookName) {
      return promise.then(function (returnVal) {
        return trigger(hookName, returnVal);
      });
    }, this.Promise.resolve(param));
  },

};
