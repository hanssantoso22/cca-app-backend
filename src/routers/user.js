const express = require('express')
const { login,
    logout, 
    logoutAll, 
    signup, 
    forgetPassword,
    updatePassword, 
    getProfile, 
    editProfile, 
    editUser } = require('../controllers/UserController')
const { auth, authAdmin, authResetToken } = require('../middleware/auth')
const router = express.Router()

//Login
router.post('/users/login', login)

//Logout
router.post('/users/logout', auth, logout)

//Logout all devices
router.post('/users/logout/all', auth, logoutAll)

//Signup
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
router.patch('/users/:id', authAdmin, editUser)


module.exports = router