const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const EventSchema = mongoose.Schema ({
    eventName: {
        type: String,
        required: true,
    },
    organizer: {
        type: ObjectID,
        required: true,
        ref: 'CCAModel'
    },
    allowedParticipants: {
        type: ObjectID,
        ref: 'CCAModel',
        default: null
    },
    visibility: {
        type: ObjectID,
        ref: 'CCAModel',
        default: null
    },
    reviews: [{
        rating: Number,
        comment: String,
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
        default: '',
    },
    link: {
        type: String,
        default: ''
    },
    done: {
        type: Boolean,
        default: false
    },
    link: String,
    description: {
        type: String,
    },
    participants: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    image: {
        type: String,
        default: null
    }
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
const Event = mongoose.model('EventModel',EventSchema)
module.exports = Event