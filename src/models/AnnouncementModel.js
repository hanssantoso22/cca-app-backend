const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const AnnouncementSchema = mongoose.Schema ({
    announcementTitle: {
        type: String,
        required: true,
    },
    organizer: [{
        type: ObjectID,
        ref: 'CCAModel',
    }],
    visibility: [{
        type: ObjectID,
        required: true,
    }],
    content: {
        type: String,
    },
    image: {
        type: String,
        default: null,
    },
    done: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'announcements',
    timestamps: true,
})
const Announcement = mongoose.model('AnnouncementModel', AnnouncementSchema)
module.exports = Announcement