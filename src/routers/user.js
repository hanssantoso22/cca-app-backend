const express = require('express')
const User = require('../models/UserModel')
const { auth, authAdmin } = require('../middleware/auth')
const router = express.Router()

//Login
router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.getAuthToken()
        res.send({ user: user.publicProfile(), token })
    }
    catch(e) {
        res.status(400).send(e)
    }
})
//Logout
router.post('/users/logout', auth, async (req,res) => {
    try {
        const activeToken = req.header('Authorization').replace('Bearer ','')
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token!==activeToken
        })
        await req.user.save()
        res.send(req.token)
    } catch (e) {
        res.status(500).send()
    }
})
//Logout all devices
router.post('/users/logout/all', auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
//Signup
router.post('/users/signup', async (req,res) => {
    const newUser = new User(req.body)
    const err = newUser.validateSync()
    try {
        if (err) {
            res.send('Invalid email/password!')
        }
        else {
            res.send(req.body)
        }
    }
    catch (e) {
        res.status(400).send('Validation error')
    }
})
//Retrieve user profile (all types of users)
router.get('/users/profile', auth, async (req,res) => {
    try {
        res.send(req.user.publicProfile())
    }
    catch (e) {
        res.status(400).send(e)
    }
})
//Edit profile (by students)
router.patch('/users/profile/edit', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['fname','password']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

//Edit user for admin (can assign a user as CCA managers)
router.patch('/users/:id', authAdmin, async (req,res) => {
    const userID = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['role','managedCCA']
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
    try {
        const updatedUser = await User.findById(userID)
        updates.forEach((update)=> updatedUser[update] = req.body[update])
        updatedUser.save()
        if (!user) {
            return res.status(400).send({error:'Update not performed!'})
        }
        res.send(updatedUser)
    }
    catch (e) {
        res.status(400).send(e)
    }
})
module.exports = router