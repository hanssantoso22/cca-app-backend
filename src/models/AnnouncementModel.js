const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const AnnouncementSchema = mongoose.Schema ({
    announcementTitle: {
        type: String,
        required: true,
    },
    organizer: {
        type: ObjectID,
        ref: 'CCAModel',
        required: true,
    },
    visibility: {
        type: [String,ObjectID],
        required: true,
    },
    content: {
        type: String,
    },
}, {
    collection: 'announcements',
    timestamps: true,
})

module.exports = mongoose.model('AnnouncementModel', AnnouncementSchema)