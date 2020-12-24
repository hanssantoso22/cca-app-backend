const mongoose = require('mongoose')
const Announcement = require('../models/AnnouncementModel')
const CCA = require('../models/CCAModel')

exports.getAnnouncements = async (req,res) => {
    try {
        const joinedCCAid = await CCA.getJoinedCCA(req.user._id)
        const announcementCollection = await Announcement.find({ visibility: { $all: joinedCCAid }})
        await announcementCollection.populate('organizer').execPopulate()
        res.send(announcementCollection)
    } catch (e) {
        res.status(400).send ('Announcement not found')
    }
    
}
exports.getAnnouncementDetails = async (req,res) => {
    try {
        const announcements = await Announcement.find({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        res.send(announcements)
    } catch (e) {
        res.status.send('Announcement not found')
    }
}
exports.createAnnouncement = async (req,res) => {
    try {
        const newAnnouncement = new Announcement(req.body)
        await newAnnouncement.save()
        res.send(newAnnouncement)
    } catch (e) {
        res.status.send('Announcement not created')
    }
}
exports.editAnnouncement = async (req,res) => {
    try {
        const announcementDetails = await Announcement.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),req.body,{new: true})
        res.send (announcementDetails)

    } catch (e) {
        res.status.send('Announcement not edited')
    }
}
