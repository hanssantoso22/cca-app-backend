const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cca-app', {
    useNewUrlParser: true,
    useMongoClient: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('connected')
});