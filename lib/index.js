'use strict';

/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');
var convertDates = require('convert-dates');
var del = require('obj-case').del;
var alias = require('alias');


/**
 * Expose `Ramen` integration.
 */

var Ramen = module.exports = integration('Ramen')
  .global('Ramen')
  .global('_ramen')
  .option('organization_id', '')
  .tag('<script src="//cdn.ramen.is/assets/ramen.js">');

/**
 * Initialize.
 *
 * @api public
 */

Ramen.prototype.initialize = function() {
  window._ramen = window._ramen || [];
  /* eslint-disable */
  (function(){var a,b,c; a = function(f){return function(){window._ramen.push([f].concat(Array.prototype.slice.call(arguments,0))); }; }; b = ["boot","ready","identify","group","track","page","reset","ask"]; for (c = 0; c < b.length; c++) {window._ramen[b[c]] = a(b[c]); } })();
  /* eslint-enable */
  window._ramen.boot(this.options.organization_id, this.options);
  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Ramen.prototype.loaded = function() {
  return !!(window._ramen && window._ramen.push !== Array.prototype.push);
};

Ramen.prototype.group = function(group) {
  var props = group.properties();
  props = alias(props, { createdAt: 'created' });
  props = alias(props, { created: 'created_at' });
  var id = group.groupId();
  if (id) props.id = id;

  window._ramen.group(props);
};

Ramen.prototype.page = function() {
  window._ramen.page();
};

Ramen.prototype.track = function(track) {
  var properties = track.properties();
  properties = convertDates(properties, function(date) { return Math.floor(date / 1000); });
  window._ramen.track(track.event(), properties);
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */
Ramen.prototype.identify = function(identify) {
  var integration = this.integration;
  var user;
  var traits;
  var opts;

  traits = identify.traits();
  opts = {}; //identify.options(integration.name);

  // Setup the basic `user` attributes: id, email, created_at, and name
  // `null` values are OK. Ramen will ignore them.
  user = {
    email: traits.email,
    id: identify.userId(),
    created_at: identify.created(),
    name: identify.name()
  };

  // Clear out Ramen-specific values from traits, set traits to equal
  // `user.traits`
  del(traits, 'email');
  del(traits, 'name');
  del(traits, 'id');
  del(traits, 'created');
  del(traits, 'createdAt');
  // user.traits = traits;

  // Convert all timestamps to epoch seconds
  user = convertDates(user, function(date) { return Math.floor(date / 1000); });

  // Rename `auth_hash_timestamp` to `timestamp` for secure mode
  opts = alias(opts, { auth_hash_timestamp: 'timestamp' });

  window._ramen.identify(user);
};
