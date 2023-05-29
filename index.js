const indexedDB = window.indexedDB

module.exports = kvidb

async function kvidb (db_name = 'db', store_name = 'store', version = 1) {
  const idb = indexedDB.open(db_name, version)
  idb.onupgradeneeded = () => idb.result.createObjectStore(store_name)
  const db = await pfy(idb)
  const kvstore = { get, put, del, batch, update, clear, close, keys, values, entries, length }
  return kvstore
  function pfy (request) {
    return new Promise((resolve, reject) => {
      request.oncomplete = request.onsuccess = () => resolve(request.result)
      request.onabort = request.onerror = () => reject(request.error)
    })
  }
  function getstore () { return db.transaction(store_name, 'readonly').objectStore(store_name) }
  function allstore () { return db.transaction(store_name, 'readwrite').objectStore(store_name) }
  function close () { return db.close() }
  function get (key) {
    const store = getstore()
    return pfy(store.get(key))
  }
  async function put (key, val) {
    const store = allstore()
    store.put(val, key)
    return !await pfy(store.transaction)
  }
  async function del (key, val) {
    const store = allstore()
    store.delete(key)
    return !await pfy(store.transaction)
  }
  async function clear () {
    const store = allstore()
    store.clear()
    return !await pfy(store.transaction)
  }
  function batch () {
    var ops = []
    return { put, del, flush, destroy }
    function put (key, val) { ops.push({ type: 'put', data: [key, val] }) }
    function del (key, val) { ops.push({ type: 'del', data: [key, val] }) }
    function destroy () { ops = undefined }
    async function flush () {
      for (var i = 0, len = ops.length; i < len; i++) {
        const { type, data } = opts[i]
        const store = allstore()
        store[type](...data)
      }
      await pfy(allstore.transaction)
      for (var i = 0; i < len; i++) kvstore?.[`on${ops[i].type}`](ops[i])
      return true
    }
  }
  function keys () {
    const store = getstore()
    return pfy(store.getAllKeys())
  }
  function values () {
    const store = getstore()
    return pfy(store.getAll())
  }
  function entries () {
    const store = getstore()
    return Promise.all([pfy(store.getAllKeys()), pfy(store.getAll())]).then(([ks, vs]) => ks.map((k, i) => [k, vs[i]]))
  }
  function length () {
    const store = getstore()
    return pfy(store.count())
  }
  async function update (key, updater) { return !await put(updater(await get(key))) }
  /*
  function createReadStream () {
    // keys: done => use('readonly', (store, tx, keys = []) => {
    //   const openCursor = (store.openKeyCursor || store.openCursor)
    //   const req = openCursor.call(store)
    //   tx.oncomplete = e => done(req.error, req.error ? undefined : keys)
    //   req.onsuccess = () => {
    //     const x = req.result
    //     if (x) (keys.push(x.key), x.continue())
    //   }
    // })
    // key: (n, done) => (n < 0) ? done(null) : use('readonly', store => {
    //   var advanced = false
    //   var req = store.openCursor()
    //   req.onsuccess = () => {
    //     var cursor = req.result
    //     if (!cursor) return
    //     if (n === 0 || advanced) return // Either 1) maybe return first key, or 2) we've got the nth key
    //     advanced = true // Otherwise, ask the cursor to skip ahead n records
    //     cursor.advance(n)
    //   }
    //   req.onerror = () => (console.error('Error in asyncStorage.key(): '), req.error.name)
    //   req.onsuccess = () => done((req.result || {}).key || null)
    // }),
    // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
    // And openKeyCursor isn't supported by Safari.
    // tx.oncomplete = () => done(null, keys)
  }
  */
}