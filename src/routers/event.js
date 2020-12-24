const { getEvents,
    getEventDetails,
    createEvent,
    editEvent, 
    markEventDone} = require('../controllers/EventController')
const { auth, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/events', auth, getEvents)
router.get('/events/:id', auth, getEventDetails)

//Manager access only
router.post('/events/create', auth, authManager, createEvent)
router.patch('/events/:id/edit', auth, authManager, editEvent)
router.patch('/events/:id/markDone', auth, authManager, markEventDone)

module.exports = router