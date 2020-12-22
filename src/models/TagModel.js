const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const TagSchema = mongoose.Schema ({
    tagName: String
}, {
    collection: 'tags'
})

module.exports = mongoose.model('TagModel',TagSchema)