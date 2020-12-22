const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const CCASchema = mongoose.Schema ({
    ccaName: {
        type: String,
        required: true,
    },
    managers: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    members: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    color: {
        type: String,
    },
}, {
    collection: 'ccas'
})
//Virtuals
CCASchema.virtual('createdAnnouncements',{
    ref: 'AnnouncementModel',
    localField: '_id',
    foreignField: 'organizer'
})
CCASchema.virtual('createdEvents',{
    ref: 'EventModel',
    localField: '_id',
    foreignField: 'organizer'
})

module.exports = mongoose.model('CCAModel',CCASchema)