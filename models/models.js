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
  google: {},
  pending: {
    pending: Boolean,
    subject: String,
    date: String,
    invitees: Array,
    datetime: String,
    emails: Array
  }
});

var reminderSchema = mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  channel: {}
})



var User = mongoose.model('User', userSchema)
var Reminder = mongoose.model('Reminder', reminderSchema)

module.exports = {
  User: User,
  Reminder: Reminder
}
