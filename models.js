
"use strict"
var mongoose = require('mongoose')
mongoose.Promise = globa.Promise;
mongoose.connect(process.env.MONGODB_URI);

var User = mongoose.model('User', {
  slackId: {
    type: String,
    required: true
  },
  slackDmId: {
    type: String,
    required: true
  },
  google: {},
  date: String,
  description: String
})

var Reminder = mongoose.model('Reminder', {
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId
    ref: 'User'
  }
})

module.exports = {
  User,
  Reminder
}
