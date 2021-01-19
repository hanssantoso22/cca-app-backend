const User = require('../models/UserModel')
const mongoose = require('mongoose')
const CCA = require('../models/CCAModel')
const mailgun_api_key = '57f4aab49c9bf268c05302053c6f3979-b6190e87-7a098fb0'
const mailgun_domain = 'sandbox7aefcf19208f4a9680c981dcd021202b.mailgun.org'
const mailgun = require('mailgun-js')({apiKey: mailgun_api_key, domain: mailgun_domain})

exports.login = async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email.toLowerCase(),req.body.password)
        const token = await user.getAuthToken()
        res.send({ user: user.publicProfile(), token })
    }
    catch(e) {
        res.status(400).send(e)
    }
}
exports.logout = async (req,res) => {
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
}

exports.logoutAll = async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}

exports.signup = async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.getAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
}

/* When a user forgets his password, first, the user will be asked to input his email. Second, a random number will be sent to the user's email. 
After entering the number, the user is allowed to set a new password. */

exports.forgetPassword = async(req,res)=> {
    try {
        const user = await User.findOne({email: req.body.email})
        const reset = await user.getResetCode()
        const resetCode = reset.code
        const resetToken = reset.token
        user.resetCode = resetCode
        user.resetToken = resetToken
        await user.save()
        const emailData = {
            from: 'CCA App Admin <admin@cca-app.com>',
            to: req.body.email,
            subject: 'Secret Key for Password Reset',
            html: `<p> Hi ${user.fname},</p>
            <p>Kindly input the code below in your application:</p>
            <p><a>${resetCode}</a></p>
            <p>This code is valid for 5 minutes. Thank you.</p>`
        }
        mailgun.messages().send(emailData, function (error, body) {
            try {
                res.send({ body,resetCode, resetToken })
            }
            catch {
                res.status(400).send(error)
            }
        });
        // res.send(reset)

    } catch (e) {
        res.status(400).send('Unsuccessful!')
    }
}
exports.updatePassword = async (req,res) => {
    const { resetCode, newPassword } = req.body
    try {
        const validateResetCode = () => {
            if (resetCode==req.resetCode) {
                return true
            }
            else throw new Error ('Not validated')
        }
        validateResetCode()
        req.user.password = newPassword
        req.user.resetToken = null
        await req.user.save ()
        res.send(req.user)

    } catch (e) {
        res.status(400).send('Failed')
    }
}
exports.getAllUsers = async (req,res) => {
    try {
        const users = await User.find({role: {$ne: 'admin'}})
        res.send(users)
    }
    catch (e) {
        res.status(400).send(e)
    }
}
exports.getProfile = async (req,res) => {
    try {
        const joinedCCA = await CCA.getJoinedCCA(req.user._id)
        const joinedCCAs = await Promise.all(joinedCCA.map(async (CCAid) => {
            const CCAlocal = await CCA.findOne({_id: CCAid})
            return CCAlocal.ccaName
        }))
        req.user.joinedCCAs = joinedCCAs
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
}
exports.getProfileBasic = async (req,res) => {
    try {
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
}
exports.getUserProfile = async (req,res) => {
    try {
        const user = await User.findOne({_id: mongoose.Types.ObjectId(req.params.id)})
        const returnedObject = user.toObject()
        const joinedCCA = await CCA.getJoinedCCA(req.params.id)
        const joinedCCAs = await Promise.all(joinedCCA.map(async (CCAid) => {
            const CCAlocal = await CCA.findOne({_id: CCAid})
            return CCAlocal.ccaName
        }))
        const managedCCA = await CCA.find ({
            managers: mongoose.Types.ObjectId(req.params.id)
        })
        const managedCCAs = managedCCA.map(cca => cca.ccaName)
        returnedObject.joinedCCAs = joinedCCAs
        returnedObject.managedCCAs = managedCCAs
        res.send(returnedObject)
    } catch (err) {
        res.status(400).send('Retrieve user profile error!')
    }
}
exports.editProfile = async (req,res) => {
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
}
exports.editUser = async (req,res) => {
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
}
exports.deleteUser = async (req,res) => {
    try {
        const deletedUser = await User.deleteOne({_id: mongoose.Types.ObjectId(req.params.id)})
        res.send(deletedUser)
    } catch (err) {
        res.status(400).send('Delete user fail!')
    }
}
exports.pastEvent = async (req,res) => {
    try {
        await req.user.populate({
            path:'pastEvents'
        }).execPopulate()
        res.send(req.user.pastEvents)
    } catch (e) {
        res.status(400).send('Error happened')
    }
}