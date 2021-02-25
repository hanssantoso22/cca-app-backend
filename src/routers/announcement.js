const { getAnnouncements,
    getAnnouncement,
    getAnnouncementDetails,
    createAnnouncement,
    editAnnouncement,
    uploadAnnouncementImage, 
    uploadImage,
    deleteAnnouncement,
    deleteImage,
    markAnnouncementObsolete,
    pushNotificationList } = require('../controllers/AnnouncementController')
const { auth } = require('../middleware/auth')
const express = require('express')
const router = express.Router()

//General access
router.get('/announcements', auth, getAnnouncements)
router.get('/announcement/:id', auth, getAnnouncement)

//Manager access only
router.post('/announcements/create', auth, createAnnouncement)
router.get('/announcement/:id/pushNotificationList', auth, pushNotificationList)
router.get('/announcement/:id/details', auth, getAnnouncementDetails)
router.patch('/announcement/:id/uploadImage', auth, uploadAnnouncementImage.single('image'), uploadImage)
router.patch('/announcement/:id/edit', auth, editAnnouncement)
router.patch('/announcement/:id/markDone', auth, markAnnouncementObsolete)
router.delete('/announcement/:id/delete', auth, deleteAnnouncement)
router.delete('/announcement/:id/deleteImage', auth, deleteImage)

module.exports = router