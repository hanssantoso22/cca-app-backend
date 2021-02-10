const { getEvents,
    getEvent,
    getEventDetails,
    registerEvent,
    createEvent,
    editEvent, 
    markEventDone,
    uploadEventImage,
    uploadImage,
    deleteImage,
    deleteEvent,
    pushNotificationList} = require('../controllers/EventController')
const { auth } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/events', auth, getEvents)
router.get('/event/:id', auth, getEvent)
router.post('/event/:id/register', auth, registerEvent)

//Manager access only
router.post('/events/create', auth, createEvent)
router.get('/event/:id/pushNotificationList', auth, pushNotificationList)
router.get('/event/:id/details', auth, getEventDetails)
router.patch('/event/:id/uploadImage', auth, uploadEventImage.single('image'), uploadImage)
router.patch('/event/:id/edit', auth, editEvent)
router.delete('/event/:id/delete', auth, deleteEvent)
router.delete('/event/:id/deleteImage', auth, deleteImage)
router.patch('/event/:id/markDone', auth, markEventDone)

module.exports = router