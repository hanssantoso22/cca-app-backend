const fs = require('fs')
const express = require('express')
const router = express.Router()
const Announcement = require('../models/AnnouncementModel')
const CCA = require('../models/CCAModel')
const Event = require('../models/EventModel')

const dumpAnnouncements = async (req,res) => {
    try {
        const data = JSON.parse(fs.readFileSync(`${process.cwd()}/src/testing/announcement_generated.json`,'utf8'))
        const insertAnnouncements = await Announcement.insertMany(data)
        res.send('Dumped successfully')
    } catch (err) {
        console.log(err)
        res.send(err).status(400)
    }
}
const dumpCCAs = async (req,res) => {
    try {
        const data = JSON.parse(fs.readFileSync(`${process.cwd()}/src/testing/cca_data.json`,'utf8'))
        const insertCCAs = await CCA.insertMany(data)
        res.send('Dumped successfully')
    } catch (err) {
        console.log(err)
        res.send(err).status(400)
    }
}
const dumpEvents = async (req,res) => {
    try {
        const data = JSON.parse(fs.readFileSync(`${process.cwd()}/src/testing/event_generated.json`,'utf8'))
        const insertEvents = await Event.insertMany(data)
        res.send('Dumped successfully')
    } catch (err) {
        console.log(err)
        res.send(err).status(400)
    }
}
router.post('/announcements/dump', dumpAnnouncements)
router.post('/ccas/dump', dumpCCAs)
router.post('/events/dump', dumpEvents)

module.exports = router