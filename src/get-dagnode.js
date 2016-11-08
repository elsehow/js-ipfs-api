'use strict'

const DAGNode = require('ipld-dag-pb').DAGNode
const concat = require('concat-stream')
const once = require('once')
const parallel = require('async/parallel')

module.exports = function (send, hash, callback) {
  callback = once(callback)

  // Retrieve the object and its data in parallel, then produce a DAGNode
  // instance using this information.
  parallel([
    (cb) => send({path: 'object/get', args: hash}, cb),

      // WORKAROUND: request the object's data separately, since raw bits in JSON
      // are interpreted as UTF-8 and corrupt the data.
      // See https://github.com/ipfs/go-ipfs/issues/1582 for more details.
    (cb) => send({path: 'object/data', args: hash}, cb)
  ], (err, res) => {
    if (err) {
      return callback(err)
    }

    const object = res[0]
    const stream = res[1]

    if (Buffer.isBuffer(stream)) {
      callback(err, new DAGNode(stream, object.Links))
    } else {
      stream
        .once('error', callback)
        .pipe(concat((data) => {
          callback(null, new DAGNode(data, object.Links))
        }))
    }
  })
}
