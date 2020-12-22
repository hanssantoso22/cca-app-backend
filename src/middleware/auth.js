require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const mongoose = require('mongoose')

const auth = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.PRIVATE_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        console.log(req)
        req.user = user

        next()
    } catch (e) {
        res.status(401).send('Not authenticated')
    }
}
const authAdmin = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.PRIVATE_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user || user.role!='admin') {
            throw new Error()
        }
        console.log(req)
        req.user = user

        next()
    } catch (e) {
        res.status(401).send('Not authenticated')
    }
}
const authManager = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const CCA = mongoose.Types.ObjectId(req.params.cca) //objectID type or string type??
        const decoded = jwt.verify(token,process.env.PRIVATE_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        const isManager = () => {
            if (user.role == 'manager') {
                if (user.managedCCA.includes(CCA)) {
                    return true
                }
                else return false
            }
            else return false
        }
        if (!user || !isManager ) {
            throw new Error()
        }
        console.log(req)
        req.user = user

        next()
    } catch (e) {
        res.status(401).send('Not authenticated')
    }
}

const authResetToken = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.FORGET_PASS_PRIVATE_KEY)
        const user = await User.findOne({ email: decoded.email, resetToken: token })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.resetCode = decoded.resetCode

        next()
    } catch (e) {
        res.status(401).send('Not authenticated')
    }
}
module.exports = { auth, authAdmin, authManager, authResetToken }