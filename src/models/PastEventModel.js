const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const PastEventSchema = new mongoose.Schema ({
    user: {
        type: ObjectID,
        ref: 'UserModel'
    },
    eventName: {
        type: String
    },
    organizer: {
        type: String
    },
    startTime: Date,
    endTime: Date,

}, {collection: 'pastEvents'})


const PastEvent = mongoose.model('PastEventModel',PastEventSchema)
module.exports = PastEvent