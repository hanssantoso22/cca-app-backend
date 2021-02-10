const express = require('express')
const router = express.Router()
const { listCCA,
  createNewCCA, 
  retrieveCCAs,
  CCADetails,
  deleteCCA,
  viewCCAMembers, 
  editMember, 
  editCCA, 
  resetManager,
  resetMember,
  getPastEvents,
  getPastAnnouncements, 
  getArchivedAnnouncements,
  getArchivedEvents} = require('../controllers/CCAController')
const { auth, authAdmin } = require('../middleware/auth')

//Admin access only
router.get("/CCAs", auth, authAdmin, retrieveCCAs)
router.post("/CCAs/create", auth, authAdmin, createNewCCA)
router.get("/CCA/:id", auth, authAdmin,CCADetails)
router.delete("/CCA/:id/delete", auth, authAdmin, deleteCCA)
router.patch("/CCA/:id/edit", auth, authAdmin, editCCA)
router.patch("/CCA/:id/resetManager", auth, authAdmin, resetManager)
router.patch("/CCA/:id/resetMember", auth, authAdmin, resetMember)

//Manager access only
router.get("/CCA/:id/viewMembers", auth,viewCCAMembers)
router.patch("/CCA/:id/editMembers", auth, editMember)
router.get("/CCA/:id/pastEvents", auth, getPastEvents)
router.get("/CCA/:id/pastAnnouncements", auth, getPastAnnouncements)
router.get("/CCA/:id/archivedEvents", auth, getArchivedEvents)
router.get("/CCA/:id/archivedAnnouncements", auth, getArchivedAnnouncements)

//General user access
router.get("/CCAs/all/names", auth, listCCA)

module.exports = router