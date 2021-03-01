const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const CCAArchiveSchema = mongoose.Schema ({
    ccaName: {
        type: String,
        required: true,
    },
    ccaDescription: {
        type: String,
        required: true,
    },
    executives: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    maincomms: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    members: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    start: Date,
    end: Date
}, {
    collection: 'ccaArchives'
})

const CCAArchive = mongoose.model('CCAArchiveModel',CCAArchiveSchema)

module.exports = CCAArchive