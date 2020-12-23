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
        const CCAs = await CCA.find()
        res.send(CCAs)
    } catch (e) {
        res.status(400).send('Error')
    }
    
}
exports.CCADetails = async (req,res) => {
    try {
        const CCADetail = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id)})
        await CCADetail.populate({
            path: 'managers'
        }).execPopulate()
        res.send(CCADetail)
    } catch (e) {
        res.status(400).send()
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
exports.editManager = async (req,res)=> {
    try {
      const updated = await CCA.findByIdAndUpdate(req.params.id,req.body,{new:true})
      req.body.managers.forEach(async (manager)=>{
          const user = await User.findById(manager)
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