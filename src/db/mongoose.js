require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_SERVER, {
    useNewUrlParser: true,
    useMongoClient: true,
})