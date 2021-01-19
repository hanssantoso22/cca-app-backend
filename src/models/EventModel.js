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
    allowedParticipants: [{
        type: [String, ObjectID],
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
    venue: {
        type: String,
    },
    link: {
        type: String,
    },
    done: {
        type: Boolean,
        default: false
    },
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

EventSchema.methods.getEventDetails = function (registrationAllowed) {
    const event = this
    const details = event.toObject()
    details.canRegister = registrationAllowed
    return details
}
EventSchema.methods.publicEventDetails = function (...deletedFields) {
    const event = this
    const eventObject = event.toObject()
    deletedFields.forEach((deletedField)=> {
        delete eventObject[deletedField]
    })
    return eventObject
}

module.exports = mongoose.model('EventModel',EventSchema)