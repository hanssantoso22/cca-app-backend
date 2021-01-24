const express = require('express')
const { login,
    logout, 
    logoutAll, 
    signup, 
    forgetPassword,
    updatePassword,
    getAllUsers,  
    getProfile,
    getProfileBasic,
    getUserProfile,
    uploadAvatar,
    editProfile, 
    editUser,
    deleteUser, 
    removeAvatar,
    changeAvatar,
    getManagedCCA} = require('../controllers/UserController')
const { getPastEvents,
    pastEventDetails,
    pastEventNotAttended,
    pastEventReview } = require('../controllers/EventController')
const { auth, authAdmin, authResetToken, authManager } = require('../middleware/auth')
const router = express.Router()

router.post('/users/login', login)
router.get('/users/logout', auth, logout)
router.post('/users/logout/all', auth, logoutAll)
router.post('/users/signup', signup)

//Forget Password (it takes user's email as an input, then it will generate a code sent to the user's email)
router.post('/users/forget', forgetPassword)

//Update Password (for Forget Password)
router.post('/users/forget/update', authResetToken, updatePassword)

//Retrieve user profile (all types of users)
router.get('/users/profile', auth, getProfile)
router.get('/users/profile/basic', auth, getProfileBasic)

//Edit profile (by students)
router.patch('/users/profile/edit', auth, editProfile)
router.patch('/users/profile/changeAvatar', auth, uploadAvatar.single('avatar'), changeAvatar)
router.patch('/users/profile/removeAvatar', auth, removeAvatar)

//Admin access
//Edit user for admin (can assign a user as CCA managers)
router.get('/user/:id', auth, authAdmin, getUserProfile)
// router.patch('/user/:id/edit', auth, authAdmin, editUser)
router.delete('/user/:id/delete', auth, authAdmin, deleteUser)
router.get('/users', auth, authAdmin, getAllUsers)

//Manager access only
router.get('/users/managedCCAs', auth, getManagedCCA)

//Controller below are defined in EventController
router.get('/users/pastEvents', auth, getPastEvents)
router.get('/users/pastEvent/:id', auth, pastEventDetails)
router.delete('/users/pastEvent/:id/delete', auth, pastEventNotAttended)
router.patch('/users/pastEvent/:id/submitReview', auth, pastEventReview)


module.exports = router