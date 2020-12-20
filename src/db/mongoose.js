const mongoose = require('mongoose');
const { MONGODB_SERVER } = require('../../config');

mongoose.connect(MONGODB_SERVER, {
    useNewUrlParser: true,
    useMongoClient: true,
})