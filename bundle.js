(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.kvidb = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const indexedDB = window.indexedDB
const console = window.console

module.exports = kvidb

const dbname = 'kvidb'
// const dbopts = { keyPath: 'key' }
const version = 1

function kvidb (opts) {
  const name = opts ? opts.name || ('' + opts) : 'store'
  const scope = `${dbname}-${name}`
  var IDB
  const makeDB = done => {
    var openreq = indexedDB.open(dbname, version)
    openreq.onerror = e => {
      console.error(e.target.errorCode)
      console.error(`[${dbname}] can't open database:`, openreq.error.name)
    }
    openreq.onupgradeneeded = () => openreq.result.createObjectStore(scope/*, dbopts*/)
    openreq.onsuccess = () => done(IDB = openreq.result)
  }
  const use = (mode, done) => {
    const next = (IDB, tx) => (tx = IDB.transaction([scope], mode), done(tx.objectStore(scope), tx))
    IDB ? next(IDB) : makeDB(next)
  }
  const exec = (req, next) => {
    req.onerror = () => next(req.error.name)
    req.onsuccess = e => next(null, e.target.result)
  }
  return {
    get: (key, done) => use('readonly', db => exec(db.get(key), done)),
    put: (key, val, done) => use('readwrite', db => exec(db.put(val, key), e => done(e, !e))),
    del: (key, done) => use('readwrite', db => exec(db.delete(key),  e => done(e, !e))),
    clear: done => use('readwrite', db => exec(db.clear(), e => done(e, !e))),
    length: done => use('readwrite', db => exec(db.count(), done)),
    close: done => (IDB ? IDB.close() : makeDB(IDB => IDB.close()), done(null, true)),
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
    keys: done => use('readonly', (db, tx, keys = []) => {
      exec((db.openKeyCursor || db.openCursor).call(db), (err, result) => {
        if (result) (keys.push(result.key), result.continue())
        else done(null, keys)
      })
    })
  }
}

},{}]},{},[1])(1)
});