const Event = require('../models/EventModel')
const { events } = require('../controllers/EventController')
const { auth, authAdmin, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

router.get('/events', auth, events)

module.exports = router