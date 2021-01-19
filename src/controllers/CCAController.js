const CCA = require('../models/CCAModel')
const User = require('../models/UserModel')
const mongoose = require('mongoose')

exports.listCCA = async (req,res) => {
    try {
        const ccaNames = await CCA.distinct('ccaName')
        res.send(ccaNames)
    } catch (e) {
        res.status(400)
    }
    
}
exports.createNewCCA = async (req,res)=>{
    try {
        const post = new CCA (req.body)
        await post.save()
        res.send(post)
    }
    catch (e) {
        res.status(400)
    }
}
exports.retrieveCCAs = async (req,res)=>{
    try {
        const CCAs = await CCA.find({})
        res.send(CCAs)
    } catch (e) {
        res.status(400).send('Retrieve CCA error!')
    }
    
}
exports.CCADetails = async (req,res) => {
    try {
        const CCADetail = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id)})
        await CCADetail.populate({
            path: 'managers'
        }).execPopulate()
        await CCADetail.populate({
            path: 'members'
        }).execPopulate()
        res.send(CCADetail)
    } catch (e) {
        res.status(400).send()
    }
}
exports.deleteCCA = async (req,res) => {
    try {
        const deletedCCA = await CCA.findOneAndDelete({_id: mongoose.Types.ObjectId(req.params.id)})
        res.send(deletedCCA)
    } catch (err) {
        res.status(400).send('Deleting CCA failed!')
    }
}
exports.viewCCAMembers = async (req,res) => {
    try {
        const CCADetail = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id)})
        await CCADetail.populate({
            path: 'members'
        }).execPopulate()
        res.send(CCADetail)
    } catch (e) {
        res.status(400).send()
    }
}
exports.editMember = async (req,res)=>{
    try {
      const updated = await CCA.findByIdAndUpdate(req.params.id,req.body,{new:true})
      
      res.send(updated)
    }
    catch (e) {
      res.status(404).send('Error')
    }
}
exports.editCCA = async (req,res)=> {
    try {
        const newManagers = req.body.managers.map((manager) => mongoose.Types.ObjectId(manager))
        const updated = await CCA.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),req.body,{new:true})
        const currentCCA = await CCA.findOne({_id:mongoose.Types.ObjectId(req.params.id)})
        currentCCA.members = [...currentCCA.members,...newManagers] //Add managers as members
        await currentCCA.save()
        newManagers.forEach(async (manager)=>{
            const user = await User.findOne({_id:manager})
            if (user.role =='student') {
                user.role = 'manager'
                await user.save()
            }
        })
        res.send(updated)
    }
    catch (e) {
      res.status(404).send('Error')
    }
}
//Note for reset managers: after being reset, the managers will still exist as members
exports.resetManager = async (req,res)=> {
    try {
      const findCCA = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
      const managers = [...findCCA.managers]
      findCCA.managers = []
      await findCCA.save()
    //Check if a user is still a manager of any CCAs
      managers.forEach(async (manager)=>{
          const user = await User.findOne({ _id: mongoose.Types.ObjectId(manager) })
          const managedCCAs = await CCA.findOne ({
              managers: mongoose.Types.ObjectId(user._id)
          })
          if (!managedCCAs) {
              user.role = 'student'
              await user.save()
          }
      })
      res.send(findCCA)
    }
    catch (e) {
      res.status(404).send('Error')
    }
}
//To reset both CCA members and managers
exports.resetMember = async (req,res) => {
    try {
        const findCCA = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id) })
        findCCA.members = []
        findCCA.managers = []
        await findCCA.save()
        res.send(findCCA)
    } catch (err) {
        res.status(400).send('Reset member failed')
    }
}
exports.getPastEvents = async (req,res) => {
    try {
        const Event = require('../models/EventModel')
        const events = await Event.find({ organizer: mongoose.Types.ObjectId(req.params.id)})
        res.send(events)
    } catch (e) {
        res.status(400).send('Events not found!')
    }
}
exports.getPastAnnouncements = async (req,res) => {
    try {
        const Announcement = require('../models/AnnouncementModel')
        const announcements = await Announcement.find({ organizer: mongoose.Types.ObjectId(req.params.id)})
        res.send(announcements)
    } catch (e) {
        res.status(400).send('Announcements not found!')
    }
}