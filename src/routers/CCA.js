const express = require('express')
const router = express.Router()
const { listCCA,
  createNewCCA, 
  retrieveCCAs,
  CCADetails,
  viewCCAMembers, 
  editMember, 
  editManager, 
  resetManager,
  getPastEvents,
  getPastAnnouncements } = require('../controllers/CCAController')
const { auth, authAdmin, authManager } = require('../middleware/auth')

//Admin access only
router.post("/CCAs/create", auth, authAdmin, createNewCCA)
router.get("/CCAs/viewAll", auth, authAdmin, retrieveCCAs)
router.get("/CCAs/:id", auth, authAdmin,CCADetails)
router.patch("/CCAs/:id/editManager", auth, authAdmin, editManager)
router.patch("/CCAs/:id/resetManager", auth, authAdmin, resetManager)

//Manager access only
router.get("/CCAs/:id/viewMembers", auth, authManager,viewCCAMembers)
router.patch("/CCAs/:id/editMember", auth, authManager, editMember)
router.get("/CCAs/:id/pastEvents", auth, authManager,getPastEvents)
router.get("/CCAs/:id/pastAnnouncements", auth, authManager,getPastAnnouncements)

//General user access
router.get("/CCAs/all/names", auth, listCCA)

module.exports = router