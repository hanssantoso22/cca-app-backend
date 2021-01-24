const { getAnnouncements,
    getAnnouncementDetails,
    createAnnouncement,
    editAnnouncement,
    uploadAnnouncementImage, 
    uploadImage} = require('../controllers/AnnouncementController')
const { auth, authManager } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/announcements', auth, getAnnouncements)
router.get('/announcement/:id', auth, getAnnouncementDetails)

//Manager access only
router.post('/announcements/create', auth, createAnnouncement)
router.patch('/announcement/:id/uploadImage', auth, uploadAnnouncementImage.single('image'), uploadImage)
router.patch('/announcement/:id/edit', auth, authManager, editAnnouncement)

module.exports = router