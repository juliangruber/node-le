
# Le db

  Generator style node interface to LevelDB.

## Usage

  Works best with [co](https://github.com/visionmedia/co).

```js
var le = require('le');
var co = require('co');

var db = le('db');

co(function*(){
  yield db.set('foo', 'bar');
  console.log('foo: %s', yield db.get('foo'));
})();
```

## Installation

```bash
$ npm install le
```

## Stability

  Expect things to change as __le__ grows with its usage. So it's only being
  used in tiny webapps.

## Roadmap

  - [x] get, set, delete
  - [x] batches
  - [x] prefix ranges
  - [x] interval ranges
  - [ ] test suite
  - [ ] streaming iteration
  - [ ] encodings
  - [ ] plugin interface (no monkey patching!)
  - [ ] nesting
  - [ ] client

## API

### db(path)

  Create or open the db at `path`.

### db#get*(key)

  Get the value at `key`.

### db#set*(key, value)

  Set the value at `key` to `value`.

### db#del*(key)

  Delete the value at `key`.

### db#batch()

  Create a batch.

### batch#set(key, value)

  Queue setting `key` to `value`.

### batch#del(key)

  Queue deleting the value at `key`.

### batch#end*()

  Write the batch of operations.

### db#keys*([range])

  Get all keys (inside `range`).

### db#values*([range])

  Get all values (whose keys are inside `range`).
  
## Ranges

  `db#keys()` and `db#values()` accept string ranges of those formats:

- `""`/`"*"`: get all
- `"prefix*"`: all keys must start with `prefix`
- `"[from,to]"`, `"[from,to)"`, `"(from,to]"`, `"(from,to)"`: all keys must be
  inside the interval, see
  [interval notations](http://en.wikipedia.org/wiki/Interval_(mathematics)#Classification_of_intervals).
  For `infinity` to x and vice versa omit the boundary, like `[,to]`.  

  In most cases that's less verbose than:
  
```json
{
  "gte": "from",
  "lte": "to"
}
```
  
  or

```json
{
  "gte": "prefix!",
  "lte": "prefix!~"
}
```

  which can be expressed simply as `[from,to]` and `prefix!*`.

## Encoding

  For now, everything is stored as `JSON`.

## Y u do this

  - want db.use() instead of monkey patching
  - generators for async ops
  - __generators for streams__
  - efficient nesting and less verbose ranges

## License

  MIT
  