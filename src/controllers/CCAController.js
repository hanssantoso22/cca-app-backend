const CCA = require('../models/CCAModel')
const User = require('../models/UserModel')
const Announcement = require('../models/AnnouncementModel')
const Event = require('../models/EventModel')
const PastEvent = require('../models/PastEventModel')
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
        const post = new CCA ({...req.body, members: req.body.managers})
        await post.save()
        req.body.managers.forEach(async manager => {
            const user = await User.findOne({_id:mongoose.Types.ObjectId(manager)})
            if (user.role =='student') {
                user.role = 'manager'
                await user.save()
            }
        })
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
        const findCCA = await CCA.findOne({_id: mongoose.Types.ObjectId(req.params.id)})
        const deletedCCA = await CCA.findOneAndDelete({_id: mongoose.Types.ObjectId(req.params.id)})
        // To change the previous managers' roles to 'student'
        findCCA.managers.forEach(async (manager)=>{
            const user = await User.findOne({ _id: mongoose.Types.ObjectId(manager) })
            const managedCCAs = await CCA.findOne ({
                managers: mongoose.Types.ObjectId(user._id)
            })
            if (!managedCCAs) {
                user.role = 'student'
                await user.save()
            }
        })
        //To delete all events and announcements created by the CCA
        await Announcement.deleteMany({organizer: mongoose.Types.ObjectId(req.params.id)})
        await Event.deleteMany({organizer: mongoose.Types.ObjectId(req.params.id)})
        await PastEvent.deleteMany({organizer: mongoose.Types.ObjectId(req.params.id)})
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
        const currentMembers = currentCCA.members.map(item => item.toString())
        //Add managers as members
        currentCCA.members = [...new Set([...currentMembers,...req.body.managers])]
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
        const previousManagers = [...findCCA.managers]
        findCCA.members = []
        findCCA.managers = []
        await findCCA.save()
        previousManagers.forEach(async (manager)=>{
            const user = await User.findOne({ _id: mongoose.Types.ObjectId(manager) })
            const managedCCAs = await CCA.findOne ({
                managers: mongoose.Types.ObjectId(user._id)
            })
            console.log(managedCCAs)
            if (!managedCCAs) {
                user.role = 'student'
                await user.save()
            }
        })
        res.send(findCCA)
    } catch (err) {
        console.log(err)
        res.status(400).send('Reset member failed')
    }
}
//Get events marked as not done
exports.getPastEvents = async (req,res) => {
    try {
        const events = await Event.find({ organizer: mongoose.Types.ObjectId(req.params.id), done: false })
        res.send(events)
    } catch (e) {
        res.status(400).send('Events not found!')
    }
}
//Get events marked as done
exports.getArchivedEvents = async (req,res) => {
    try {
        const events = await Event.find({ organizer: mongoose.Types.ObjectId(req.params.id), done: true })
        res.send(events)
    } catch (e) {
        res.status(400).send('Events not found!')
    }
}
//Get announcements marked as not done
exports.getPastAnnouncements = async (req,res) => {
    try {
        const announcements = await Announcement.find({ organizer: mongoose.Types.ObjectId(req.params.id), done: false })
        res.send(announcements)
    } catch (e) {
        res.status(400).send('Announcements not found!')
    }
}
//Get announcements marked as done
exports.getArchivedAnnouncements = async (req,res) => {
    try {
        const announcements = await Announcement.find({ organizer: mongoose.Types.ObjectId(req.params.id), done: true })
        res.send(announcements)
    } catch (e) {
        res.status(400).send('Announcements not found!')
    }
}