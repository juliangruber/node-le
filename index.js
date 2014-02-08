
/**
 * Module dependencies.
 */

var level = require('level');
var thunkify = require('thunkify');
var concat = thunkify(require('stream-to').array);
var debug = require('debug')('le');

/**
 * Expose `Db`.
 */

module.exports = Db;

/**
 * A friendly LevelDB wrapper.
 *
 * @param {String} path
 * @return {Level}
 * @api public
 */

function Db(path) {
  if (!(this instanceof Db)) return new Db(path);
  this.db = level(path, { valueEncoding: 'json' });
  this.db.get = thunkify(this.db.get.bind(this.db));
  this.db.put = thunkify(this.db.put.bind(this.db));
}

/**
 * Get the value of `key`.
 *
 * @param {String} key
 * @return {Object}
 * @api public
 */

Db.prototype.get = function*(key){
  debug('getting %s', key);
  try {
    var value = yield this.db.get(key);
    debug('got %s (%j)', key, value);
  } catch (err) {
    debug('empty %s', key);
    return;
  }
  return value;
};

/**
 * Set the value of `key`.
 *
 * @param {String} key
 * @param {Object} value
 * @api public
 */

Db.prototype.set = function*(key, value){
  debug('setting %s to %j', key, value);
  yield this.db.put(key, value);
  debug('set %s to %j', key, value);
};

/**
 * Create a batch.
 *
 * @return {Batch}
 * @api public
 */

Db.prototype.batch = function(){
  return new Batch(this);
};

/**
 * Batch object.
 *
 * @param {Db} db
 * @return {Batch}
 * @api private
 */

function Batch(db){
  this.batch = db.db.batch();
  debug('batch: create');
}

/**
 * Set the value of `key`.
 *
 * @param {String} key
 * @param {Object} value
 * @api public
 */

Batch.prototype.set = function(key, value){
  debug('batch: set %s to %j', key, value);
  this.batch.put(key, value);
};

/**
 * Delete the value of `key`.
 *
 * @param {String} key
 * @api public
 */

Batch.prototype.del = function(key){
  debug('batch: del %s', key);
  this.batch.del(key);
};

/**
 * Write the batch.
 *
 * @api public
 */

Batch.prototype.end = function*(){
  debug('batch: writing %s ops', this.batch.ops.length);
  yield thunkify(this.batch.write.bind(this.batch))();
  debug('batch: wrote');
};

/**
 * Get all keys.
 *
 * @param {String=} range
 * @return {Array[String]}
 * @api public
 */

Db.prototype.keys = function*(range){
  var opts = parseRange(range);
  return yield concat(this.db.createKeyStream());
};

/**
 * Get values.
 *
 * @param {String=} range
 * @return {Array[Mixed]}
 * @api public
 */

Db.prototype.values = function*(range){
  var opts = parseRange(range);
  return yield concat(this.db.createValueStream(opts));
};

/**
 * Parse a range string into an options object.
 *
 * Formats:
 *
 *   - ""
 *   - "prefix*"
 *   - "[from,to]", "(from,to)", "[from,to)", "(from,to]"
 *
 * @param {String=} range
 * @return {Object}
 * @api private
 */

function parseRange(range){
  var opts = {};

  // prefix*

  if ('*' == range[range.length - 1]) {
    var prefix = range.substr(0, range.length - 1);
    opts = { gt: prefix, lt: prefix + '\xff' };
  }

  // [from, to]

  var match;
  if (match = /^(\[|\()([^,]*), *([^ \]\)]*)(\]|\))$/.exec(range)) {
    if (match[3] == '') match[3] = '\xff';
    opts[{
      '[': 'gte',
      '(': 'gt'
    }[match[1]]] = match[2];
    opts[{
      ']': 'lte',
      ')': 'lt'
    }[match[4]]] = match[3];
  }

  return opts;
}
