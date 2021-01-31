const mongoose = require('mongoose')
const multer = require('multer')
const sharp = require('sharp')
const AWS = require('aws-sdk')
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
exports.getAnnouncement = async (req,res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        res.send(announcement)
    } catch (e) {
        res.status(400).send('Announcement not found')
    }
}
exports.getAnnouncementDetails = async (req,res) => {
    try {
        const announcement = await Announcement.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        const announcementObject = announcement.toObject()
        if (announcementObject.image!=null) {
            delete announcementObject.image
        }
        res.send(announcementObject)
        // res.send(announcement)
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
            adjustedBuffer = await sharp(req.file.buffer).png().resize({
                width: 1000,
                height: 1000,
                fit: sharp.fit.inside
            }).toBuffer()
        }
        let image = null
        /* UPLOADING IMAGE TO AMAZON S3 */
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        })
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `announcement-thumbnails/${req.params.id}-thumbnail.png`,
            Body: adjustedBuffer
        }
        const uploadPromise = s3.upload(params).promise()
        const uploadedData = await uploadPromise
        image = uploadedData.Location

        /* STORING IMAGE BUFFER IN DATABASE */
        /* if (req.file) {
            image = adjustedBuffer
        } */
        const announcement = await Announcement.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, { image }, {new: true})
        res.send(announcement)
    } catch (err) {
        res.status(400).send()
        console.log(err)
    }
}
//This controller only deletes image in the AWS S3
exports.deleteImage = async (req,res) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        })
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `announcement-thumbnails/${req.params.id}-thumbnail.png`,
        }
        const deletePromise = s3.deleteObject(params).promise()
        const deletedData = await deletePromise
        const announcement = await Announcement.findOneAndUpdate({_id: mongoose.Types.ObjectId(req.params.id)}, { image: null }, {new: true})
        res.send(announcement)
    } catch (err) {
        res.status(400).send(err)
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
exports.deleteAnnouncement = async (req,res) => {
    try {
        const deleted = await Announcement.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        res.send(deleted)
    } catch (err) {
        res.status(400).send(err)
    }
}
