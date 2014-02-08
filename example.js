var le = require('./');
var co = require('co');

var db = le('db');

co(function*(){
  yield db.set('foo', 'bar');
  console.log('foo: %s', yield db.get('foo'));
})();
