# kv-idb
minimal zero-dependencies key-value store backed by indexedDB

# usage
`npm install kv-idb`

```js
var kvidb = require('kv-idb')

var db = kvidb()
await db.clear(),                // true
await db.put('foo', 'bar'),      // true
await db.put('null', {}),        // true
await db.length(),               // 2
await db.keys(),                 // ["foo", "null"]
await db.get('foo'),             // "bar"
await db.clear(),                // true
await db.get('foo'),             // undefined
await db.put('foo', 'bar1'),     // true
await db.put('foo2', 'bar2'),    // true
await db.put('foo3', 'bar3'),    // true
await db.get('foo3'),            // "bar3"
await db.put('foo4', null),      // true
await db.get('foo4'),            // null
await db.put('foo5', undefined), // true
await db.get('foo5'),            // undefined
await db.get('foo'),             // "bar1"
await db.get('foo3'),            // "bar3"
await db.del('foo3'),            // true
await db.get('foo3'),            // undefined
await db.length(),               // 4
await db.keys(),                 // ["foo", "foo2", "foo4", "foo5"]
```
