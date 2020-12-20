const mongoose = require('mongoose')

const AnnouncementSchema = mongoose.Schema ({
    announcementTitle: {
        type: String,
        required: true,
    },
    organizer: {
        type: String,
        required: true,
    },
    visibility: {
        type: String,
        required: true,
    },
    content: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('AnnouncementModel', AnnouncementSchema)