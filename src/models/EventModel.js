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
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    done: Boolean,
    link: String,
    description: {
        type: String,
    },
    registeredApplicants: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    tags: [{
        type: String
    }]
}, {
    collection: 'events'
})

module.exports = mongoose.model('EventModel',EventSchema)