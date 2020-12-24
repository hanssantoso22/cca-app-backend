const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const PastEventSchema = new mongoose.Schema ({
    user: {
        type: ObjectID,
        ref: 'UserModel'
    },
    eventID: {
        type: ObjectID,
        ref: 'EventModel'
    },
    eventName: {
        type: String
    },
    organizer: {
        type: String
    },
    startTime: Date,
    endTime: Date,
    read: {
        type: Boolean,
        default: false
    },

}, {collection: 'pastEvents'})

const PastEvent = mongoose.model('PastEventModel',PastEventSchema)
module.exports = PastEvent