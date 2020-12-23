const express = require('express')
const { login,
    logout, 
    logoutAll, 
    signup, 
    forgetPassword,
    updatePassword, 
    getProfile, 
    editProfile, 
    editUser,
    pastEvent } = require('../controllers/UserController')
const { auth, authAdmin, authResetToken } = require('../middleware/auth')
const router = express.Router()

router.post('/users/login', login)
router.post('/users/logout', auth, logout)
router.post('/users/logout/all', auth, logoutAll)
router.post('/users/signup', signup)

//Forget Password (it takes user's email as an input, then it will generate a code sent to the user's email)
router.post('/users/forget', forgetPassword)

//Update Password (for Forget Password)
router.post('/users/forget/update', authResetToken, updatePassword)

//Retrieve user profile (all types of users)
router.get('/users/profile', auth, getProfile)

//Edit profile (by students)
router.patch('/users/profile/edit', auth, editProfile)

//Edit user for admin (can assign a user as CCA managers)
router.patch('/users/:id', auth, authAdmin, editUser)

router.get('/users/pastEvents', auth, pastEvent)


module.exports = router