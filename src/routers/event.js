const { getEvents,
    getEventDetails,
    registerEvent,
    createEvent,
    editEvent, 
    markEventDone,
    uploadEventImage,
    uploadImage} = require('../controllers/EventController')
const { auth, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/events', auth, getEvents)
router.get('/event/:id', auth, getEventDetails)
router.post('/event/:id/register', auth, registerEvent)

//Manager access only
router.post('/events/create', auth, createEvent)
router.patch('/event/:id/uploadImage', auth, uploadEventImage.single('image'), uploadImage)
router.patch('/event/:id/edit', auth, authManager, editEvent)
router.patch('/event/:id/markDone', auth, authManager, markEventDone)

module.exports = router