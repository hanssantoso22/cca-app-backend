const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const CCASchema = mongoose.Schema ({
    ccaName: {
        type: String,
        required: true,
    },
    managers: [{
        type: String,
    }],
    members: [{
        type: String,
    }],
    color: {
        type: String,
    },
}, {
    collection: 'ccas'
})

module.exports = mongoose.model('CCAModel',CCASchema)