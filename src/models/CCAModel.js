const { ObjectID } = require('mongodb')
const mongoose = require('mongoose')

const CCASchema = mongoose.Schema ({
    ccaName: {
        type: String,
        required: true,
    },
    managers: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    members: [{
        type: ObjectID,
        ref: 'UserModel'
    }],
    color: {
        type: String,
    },
    description: String
}, {
    collection: 'ccas'
})
//Virtuals
CCASchema.virtual('createdAnnouncements',{
    ref: 'AnnouncementModel',
    localField: '_id',
    foreignField: 'organizer'
})
CCASchema.virtual('createdEvents',{
    ref: 'EventModel',
    localField: '_id',
    foreignField: 'organizer'
})

CCASchema.statics.getJoinedCCA = async (userID) => {
    const joinedCCA = await CCA.distinct('_id',{ members: mongoose.Types.ObjectId(userID) })
    const joinedCCAid = joinedCCA.map((stringID)=>mongoose.Types.ObjectId(stringID))
    return joinedCCAid //returns an array of object id
}

const CCA = mongoose.model('CCAModel',CCASchema)

module.exports = CCA