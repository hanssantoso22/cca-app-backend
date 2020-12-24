const { getAnnouncements,
    getAnnouncementDetails,
    createAnnouncement,
    editAnnouncement } = require('../controllers/AnnouncementController')
const { auth, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/announcements', auth, getAnnouncements)
router.get('/announcements/:id', auth, getAnnouncementDetails)

//Manager access only
router.post('/announcements/create', auth, authManager, createAnnouncement)
router.patch('/announcements/:id/edit', auth, authManager, editAnnouncement)

module.exports = router