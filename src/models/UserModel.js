require('dotenv').config()
const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema ({
    fname: {
        type: String,
        immutable: false,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        immutable: false,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    resetToken: String,
    role: {
        type: String,
        enum: ['admin','manager','student'],
        default: 'student'
    },
    year: {
        type: String
    },
    faculty: {
        type: String  
    },
    avatar: {
        type: String,
        default: null,
    },
    pushNotificationToken: {
        type: String,
        default: null
    }
}, {collection: 'users'})

//Virtuals
UserSchema.virtual('pastEvents',{
    ref: 'PastEventModel',
    localField: '_id',
    foreignField: 'user'
})

//Hash password each time password field of a document is modified
UserSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    if (user.isModified('email')) {
        user.email = user.email.toLowerCase()
    }
    next()
})

//To authenticate a user by comparing the given data with the data from database
UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error ('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) {
        throw new Error ('Unable to login') 
    }
    return user
}
//To give a token for a user and store the token in the database
UserSchema.methods.getAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString(), role: user.role, managedCCA: user.managedCCA },process.env.PRIVATE_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

UserSchema.methods.getResetCode = async function () {
    const user = this
    const code = Math.floor(Math.random()*900000+100000)
    const token = jwt.sign({email: user.email, resetCode: code },process.env.FORGET_PASS_PRIVATE_KEY,{expiresIn: '5m'})
    user.resetToken = token
    await user.save()
    return { code, token }
    
}

UserSchema.methods.publicProfile = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

const User = mongoose.model('UserModel',UserSchema)
module.exports = User