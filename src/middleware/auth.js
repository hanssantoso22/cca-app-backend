require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/UserModel')
const CCA = require('../models/CCAModel')
const mongoose = require('mongoose')

const auth = async (req,res,next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.PRIVATE_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.user = user

        next()
    } catch (e) {
        res.status(401).send('Not authenticated')
    }
}
const authAdmin = async (req,res,next) => {
    try {
        if (req.user.role!='admin') {
            throw new Error()
        }
        next()
    } catch (e) {
        res.status(401).send('Not authenticated (admin)')
    }
}
const authManager = async (req,res,next) => {
    try {
        if (req.user.role == 'manager') {
            const retrieveCCA = await CCA.findOne({ _id: mongoose.Types.ObjectId(req.params.id)})
            if (!retrieveCCA.managers.includes(req.user._id)) {
                throw new Error()
            }
        }
        else throw new Error()

        next()
    } catch (e) {
        res.status(401).send('Not authenticated (manager)')
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