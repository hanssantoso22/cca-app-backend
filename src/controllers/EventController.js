const mongoose = require('mongoose')
const Event = require('../models/EventModel')
const multer = require('multer')
const sharp = require('sharp')
const moment = require('moment')
const AWS = require('aws-sdk')
const PastEvent = require('../models/PastEventModel')
const CCA = require('../models/CCAModel')
const gapi = require('../utilities/googleapi')

//Get events (for public)
exports.getEvents = async (req,res) => {
    try {
        const joinedCCAid = await CCA.getJoinedCCA(req.user._id)
        const eventCollection = await Event.find({visibility: {$in: [...joinedCCAid, null]}, done: false}).sort({startTime: 1}).populate('organizer')
        let retrievedEvents = {}
        eventCollection.forEach(event => {
            const parsedStartDate = moment(event.startTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('YYYY-MM-DD')
            if (!Object.keys(retrievedEvents).includes(parsedStartDate)) {
                retrievedEvents[parsedStartDate] = []
            }
            retrievedEvents[parsedStartDate].push({
                id: event._id,
                name: event.eventName,
                organizer: event.organizer.ccaName,
                height: 80,
                startTime: moment(event.startTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('HH:mm'),
                endTime: moment(event.endTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('HH:mm'),
                color: event.organizer.color
            })
        })
        res.send(retrievedEvents)
    } catch (e) {
        res.status(400).send (e)
        console.log(e)
    }
    
}
//Get event details (for public)
exports.getEvent = async (req,res) => {
    try {
        const joinedCCAid = await CCA.distinct('_id', {members: mongoose.Types.ObjectId(req.user._id)})
        const joinedCCA = joinedCCAid.map((cca) => cca.toString())
        const eventDetails = await Event.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        const eventObject = eventDetails.toObject()
        //To check if user has registered for the event
        const PastEvent = require('../models/PastEventModel')
        const pastEvents = await PastEvent.find({user: req.user._id, event: eventObject._id})
        if (pastEvents.length == 0) {
            eventObject.registered = false
        }
        else {
            eventObject.registered = true
        }
        //To check if user can join the event
        if (eventObject.allowedParticipants == null) {
            eventObject.canRegister = true
        }
        else {
            const found = joinedCCA.includes(eventObject.allowedParticipants.toString())
            if (found) {
                eventObject.canRegister = true
            }
            else {
                eventObject.canRegister = false
            }
        }
        res.send(eventObject)
    } catch (e) {
        res.status(400).send('Event not found')
        console.log(e)
    }
}
//Get registered events/reminders from PastEvent collection (for public)
exports.getReminders = async (req,res) => {
    try {
        const pastRegisteredEvents = await PastEvent.find({user: mongoose.Types.ObjectId(req.user._id)}).populate('event').populate('organizer')
        const eventCollection = pastRegisteredEvents.filter(pastEvent => pastEvent.event.done == false)
        let retrievedEvents = {}
        eventCollection.forEach(pastEvent => {
            const parsedStartDate = moment(pastEvent.event.startTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('YYYY-MM-DD')
            if (!Object.keys(retrievedEvents).includes(parsedStartDate)) {
                retrievedEvents[parsedStartDate] = []
            }
            retrievedEvents[parsedStartDate].push({
                id: pastEvent.event._id,
                name: pastEvent.event.eventName,
                organizer: pastEvent.organizer.ccaName,
                height: 80,
                startTime: moment(pastEvent.event.startTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('HH:mm'),
                endTime: moment(pastEvent.event.endTime, `${'YYYY-MM-DD'}T${'HH:mm:ss.sssZ'}`).format('HH:mm'),
                color: pastEvent.organizer.color
            })
        })
        res.send(retrievedEvents)
    } catch (error) {
        res.status(400).send(error)
    }
}
//Get reminder details (for public)
exports.getReminderDetails = async (req, res) => {
    try {
        const selectedEvent = await Event.findById(mongoose.Types.ObjectId(req.params.eventID))
        res.send(selectedEvent)
    } catch (error) {
        res.send(error).status(400)
    }
}
//Get event details (for managers). It's used as the initial data for editing events
exports.getEventDetails = async (req,res) => {
    try {
        const eventDetails = await Event.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        })
        await eventDetails.populate('participants').execPopulate()
        const eventObject = eventDetails.toObject()
        if (eventObject.image!=null) {
            delete eventObject.image
        }
        res.send(eventObject)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
//Register for an event (for public)
exports.registerEvent = async (req, res) => {
    try {
        //Add user to registeredApplicants array
        const event = await Event.findOne({
            _id: mongoose.Types.ObjectId(req.params.id)
        })
        event.participants = event.participants.concat (req.user._id)
        await event.save()

        //Create new document in PastEvent collection
        const newPastEvent = new PastEvent({
            user: req.user._id,
            event: req.params.id,
            organizer: event.organizer
        })
        await newPastEvent.save()
        res.send(event)
    } catch (e) {
        res.status(400).send('Registration failed')
        console.log(e)
    }
}
//Upload event image (for managers)
exports.uploadEventImage = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|heic)/)) {
            cb(new Error('Unsupported file type!'))
        }
        cb(undefined, true)
    },
})
//For managers
exports.createEvent = async (req,res) => {
    try {
        const newEvent = new Event(req.body)
        await newEvent.save()
        res.send(newEvent)
    } catch (e) {
        res.status(400).send(e)
    }
}
exports.pushNotificationList = async (req,res) => {
    try {
        const User = require('../models/UserModel')
        const event = await Event.findById(mongoose.Types.ObjectId(req.params.id))
        if (event.visibility == null) {
            const users = await User.find ({})
            const pushNotificationTokens = users.filter(user => user.pushNotificationToken)
            res.send(pushNotificationTokens)
        }
        else {
            const organizer = await CCA.findById(mongoose.Types.ObjectId(event.organizer)).populate('members')
            const ccaMembers = organizer.members
            const pushNotificationTokens = ccaMembers.filter(item => item.pushNotificationToken)
            res.send(pushNotificationTokens)
        }
    } catch (error) {
        res.status(400).send(error)
    }
}
//For managers
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
//For managers
exports.deleteEvent = async (req,res) => {
    try {
        const deleted = await Event.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        await PastEvent.deleteMany({event: mongoose.Types.ObjectId(req.params.id)})
        res.send(deleted)
    } catch (err) {
        res.status(400).send(err)
        console.log(err)
    }
}
//For managers
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
//For managers
exports.editEvent = async (req,res) => {
    try {
        const eventDetails = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),req.body,{new: true})
        res.send (eventDetails)

    } catch (e) {
        res.status(400).send('Event not edited')
    }
}
//For managers
exports.markEventDone = async (req,res) => {
    try {
        const doneEvent = await Event.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),{ done: true },{ new: true })
        res.send(doneEvent)
    } catch (e) {
        res.status(400).send('Event is not marked as done!')
    }
} 

//Past event controllers (for the events that have been marked as 'done')
exports.getPastEvents = async (req,res) => {
    try {
        const pastEvents = await PastEvent.find({ 
            user: mongoose.Types.ObjectId(req.user._id)
        }).populate('event').populate('organizer')
        const events = pastEvents.filter(item => item.event.done == true)
        res.send(events)
    } catch (e) {
        res.status(400).send('Event not found')
    }
}
exports.pastEventDetails = async (req,res) => {
    try {
        const pastEvent = await PastEvent.findOne({
            _id: mongoose.Types.ObjectId(req.params.id),
        }).populate('event').populate('organizer')
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
        console.log(e)
    }
}
exports.pastEventReview = async (req,res) => {
    try {
        const pastEvent = await PastEvent.findOneAndUpdate ({
            _id: mongoose.Types.ObjectId(req.params.id)
        }, {reviewed: true, read: true})
        const updatedEvent = await Event.findOne ({
            _id: mongoose.Types.ObjectId(pastEvent.event)
        })
        updatedEvent.reviews = updatedEvent.reviews.concat(req.body)
        await updatedEvent.save()
        res.send(updatedEvent)
    } catch (e) {
        res.status(400).send('Event not reviewed')
    }
}