const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const EventSchema = mongoose.Schema ({
    eventName: {
        type: String,
        required: true,
        immutable: false,
    },
    organizer: {
        type: ObjectID,
        required: true,
        ref: 'CCAModel'
    },
    members: [{
        type: String,
    }],
    allowedParticipants: [{
        type: ObjectID,
        ref: 'CCAModel'
    }],
    visibility: [{
        type: ObjectID,
        ref: 'CCAModel'
    }],
    reviews: [{
        type: String,
        max: 200,
    }],
    done: Boolean,
    link: String,
    description: {
        type: String,
    },
    registeredApplicants: [{
        type: String
    }],
    tags: [{
        type: String
    }]
}, {
    collection: 'events'
})

module.exports = mongoose.model('EventModel',EventSchema)