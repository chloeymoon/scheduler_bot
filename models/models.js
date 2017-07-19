var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

var userSchema = mongoose.Schema({
  slackId: {
    type: String,
    required: true
  },
  slackDmId: {
    type: String,
    required: true
  },
  google: {}
});


var User = mongoose.model('User', userSchema)

module.exports = {
  User: User
}
