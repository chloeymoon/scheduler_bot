var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
  slackId: {
    type: String,
    required: true
  },
  slackname: {
    type: String,
    required: true
  },
  googleProfile: {
    type: String,
  }
});


var User = mongoose.model('User', userSchema)
module.exports= {
  User: User
}
