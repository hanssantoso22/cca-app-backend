const express = require('express')
const router = express.Router()
const CCA = require('../models/CCAModel')
const { auth, authAdmin, authManager } = require('../middleware/auth')

//Create new CCA (done by admin)
router.post("/CCAs/create", authAdmin, async (req,res)=>{
  try {
    const post = new CCA (req.body)
    post.save()
    res.send(post)
  }
  catch {
    res.status(400)
  }
})
router.get("/CCAs",authAdmin, async (req,res)=>{
  const color = req.params.color
  const CCAs = await CCA.find()
  res.send(CCAs)
})

//Edit CCA details for CCA Manager (intended for editing the members field)
router.patch("/CCAs/:id", authManager, async (req,res)=>{
  try {
    const updated = await CCA.findByIdAndUpdate(req.params.id,req.body,{new:true})
    res.send(updated)
  }
  catch (e) {
    res.status(404)
    res.send(e)
  }
})

module.exports = router