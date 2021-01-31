const mongoose = require('mongoose')
const Event = require('../models/EventModel')
const multer = require('multer')
const sharp = require('sharp')
const AWS = require('aws-sdk')
const PastEvent = require('../models/PastEventModel')
const CCA = require('../models/CCAModel')

exports.getEvents = async (req,res) => {
    try {
        const joinedCCAid = await CCA.getJoinedCCA(req.user._id)
        const eventCollection = await Event.find({ visibility: { $all: joinedCCAid }, done: false})
        await eventCollection.populate('organizer').execPopulate()
        eventCollection = eventCollection.publicEventDetails(
            'reviews',
            'allowedParticipants',
            'visibility',
            'done',
            'registeredApplicants'
        )
        res.send(eventCollection)
    } catch (e) {
        res.status(400).send ('Event not found')
    }
    
}
exports.getEvent = async (req,res) => {
    try {
        const joinedCCA = await CCA.getJoinedCCA(req.user._id)
        const eventDetails = await Event.find({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        const isRegistrationAllowed = async () => {
            const event = await Event.find({
                _id: mongoose.Types.ObjectId(req.params.id), 
                allowedParticipants: {$all: joinedCCA}
            })
            if (event) return true
            else return false
        }
        const returnedValue = eventDetails.getEventDetails(isRegistrationAllowed())
        res.send(returnedValue)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
exports.getEventDetails = async (req,res) => {
    try {
        const eventDetails = await Event.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        const eventObject = eventDetails.toObject()
        if (eventObject.image!=null) {
            delete eventObject.image
        }
        res.send(eventObject)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
exports.registerEvent = async () => {
    try {
        const event = await Event.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        })
        event.registeredApplicants = event.registeredApplicants.concat (req.user._id)
        await event.save()
        res.send(event)
    } catch (e) {
        res.status(400).send('Registration failed')
    }
}
exports.uploadEventImage = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|heic)/)) {
            cb(new Error('Unsupported file type!'))
        }
        cb(undefined, true)
    },
})
exports.createEvent = async (req,res) => {
    try {
        const newEvent = new Event(req.body)
        await newEvent.save()
        res.send(newEvent)
    } catch (e) {
        res.status(400).send(e)
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
            Key: `event-thumbnails/${req.params.id}-thumbnail.png`,
            Body: adjustedBuffer
        }
        const uploadPromise = s3.upload(params).promise()
        const uploadedData = await uploadPromise
        image = uploadedData.Location
        /* STORING IMAGE BUFFER IN DATABASE */
        /* if (req.file) {
            image = adjustedBuffer
        } */
        const event = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), { image }, {new: true})
        res.send(event)
    } catch (err) {
        res.status(400).send(err)
    }
}
exports.deleteEvent = async (req,res) => {
    try {
        const deleted = await Event.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        res.send(deleted)
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }
}
exports.deleteImage = async (req,res) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        })
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `event-thumbnails/${req.params.id}-thumbnail.png`,
        }
        const deletePromise = s3.deleteObject(params).promise()
        const deletedData = await deletePromise
        const event = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), { image: null }, {new: true})
        res.send(event)
    } catch (err) {
        res.status(400).send(err)
    }
}
exports.editEvent = async (req,res) => {
    try {
        const eventDetails = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),req.body,{new: true})
        res.send (eventDetails)

    } catch (e) {
        res.status(400).send('Event not edited')
    }
}
exports.markEventDone = async (req,res) => {
    try {
        const doneEvent = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),{ done: true },{ new: true })
        doneEvent.registeredApplicants.forEach (async(registeredApplicant) => {
            const newPastEvent = new PastEvent ({
                user: registeredApplicant,
                eventID: doneEvent._id,
                eventName: doneEvent.eventName,
                organizer: doneEvent.organizer,
                startTime: doneEvent.startTime,
                endTime: doneEvent.endTime,
            })
            await newPastEvent.save()
        })
        res.send(doneEvent)
    } catch (e) {
        res.status(400).send('Event is not marked as done!')
    }
} 

//Past event controllers
exports.getPastEvents = async (req,res) => {
    try {
        const pastEvents = await PastEvent.find({ 
            user: mongoose.Types.ObjectId(req.user._id),
        })
        res.send(pastEvents)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
exports.pastEventDetails = async (req,res) => {
    try {
        const pastEvent = await PastEvent.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        res.send(pastEvent)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
exports.pastEventNotAttended = async (req,res) => {
    try {
        const deletedEvent = await PastEvent.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id)})
        res.send(deletedEvent)
    } catch (e) {
        res.status(400).send('Event not deleted')
    }
}
exports.pastEventReview = async (req,res) => {
    try {
        const pastEvent = await PastEvent.findOne ({
            _id: mongoose.Types.ObjectId(req.params.id)
        })
        const updatedEvent = await Event.findOne ({
            _id: mongoose.Types.ObjectId(pastEvent.eventID)
        })
        updatedEvent.reviews = updatedEvent.reviews.concat(req.body.review)
        updatedEvent.done = true
        await updatedEvent.save()
        res.send(updatedEvent)
    } catch (e) {
        res.status(400).send('Event not reviewed')
    }
}