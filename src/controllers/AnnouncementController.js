const mongoose = require('mongoose')
const multer = require('multer')
const sharp = require('sharp')
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
        res.status(400).send('Announcement not found')
    }
}
exports.uploadAnnouncementImage = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|heic)/)) {
            cb(new Error('Unsupported file type!'))
        }
        cb(undefined, true)
    },
})
exports.createAnnouncement = async (req,res) => {
    try {
        const newAnnouncement = new Announcement(req.body)
        await newAnnouncement.save()
        res.send(newAnnouncement)
    } catch (e) {
        res.status(400).send('Announcement not created')
    }
}
exports.uploadImage = async (req, res) => {
    try {
        let adjustedBuffer = null
        if (req.file) {
            adjustedBuffer = await sharp(req.file.buffer).png().toBuffer()
        }
        let image = null
        /* UPLOADING IMAGE TO AMAZON S3 */
        /* const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        })
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `announcement-thumbnails/${req.body.announcementTitle}-${req.body.organizer}-thumbnail.png`,
            Body: adjustedBuffer
        }
        const uploadPromise = s3.upload(params).promise()
        const uploadedData = await uploadPromise
        image = uploadedData.Location */

        /* STORING IMAGE BUFFER IN DATABASE */
        if (req.file) {
            image = adjustedBuffer
        }
        const announcement = await Announcement.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, { image }, {new: true})
        res.send(announcement)
    } catch (err) {
        res.status(400).send()
        console.log(err)
    }
} 
exports.editAnnouncement = async (req,res) => {
    try {
        const announcementDetails = await Announcement.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),req.body,{new: true})
        res.send (announcementDetails)

    } catch (e) {
        res.status(400).send('Announcement not edited')
    }
}
