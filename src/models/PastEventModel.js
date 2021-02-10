const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const PastEventSchema = new mongoose.Schema ({
    user: {
        type: ObjectID,
        ref: 'UserModel'
    },
    event: {
        type: ObjectID,
        ref: 'EventModel'
    },
    organizer: {
        type: ObjectID,
        ref: 'CCAModel'
    },
    read: {
        type: Boolean,
        default: false
    },
    reviewed: {
        type: Boolean,
        default: false
    }

}, {collection: 'pastEvents'})

const PastEvent = mongoose.model('PastEventModel',PastEventSchema)
module.exports = PastEvent