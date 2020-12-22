const Event = require('../models/EventModel')
const { auth, authAdmin, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

module.exports = router