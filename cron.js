"use strict"

console.log('hello im running')

var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var axios = require('axios')
var User = require('./models/models').User
var Reminder = require('./models/models').Reminder
var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);
let channel;

var {web} = require('./index')


rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  console.log('connected')
  //find all reminders that are due today or tomorrow
  var today = new Date()
  console.log('today is', today)
  var today2 = new Date(today.getTime() - 24 * 60* 60 * 1000)
  console.log('today2 is', today2)
  var tomorrow = new Date(today.getTime() + 24 * 60* 60 * 1000)
  console.log('tomorrow is', tomorrow)
  //2017-07-19T21:49:24.506Z

  Reminder.find({date: {$gt: today2, $lt: tomorrow}}).populate("user")
  .then(function(reminders){
    console.log(reminders)
    for (var i = 0; i < reminders.length; i++) {
      console.log(reminders[i].subject)
      rtm.sendMessage("'" + reminders[i].subject+ "' is due soon! Hurry! Yay! We did something!! So you should do something too!!!!!!!", reminders[i].user.slackDmId)
    }
  })
  .catch(function(err){
    console.log(err)
  })
});

User.findOne()
  .then(function(user){
    web.chat.postMessage(user.slackDmId,
      'Currrent itme is ' + new Date(),
    function(){
      process.exit(0) // how you kill the script
      //so after sending the message, it's gonna end
    })
  })

rtm.start()

//@terminal: heroky run npm run cron
// heroku with freqneucy:
//go to heroku -- app -- overview -- configure add-ons: schedules:
    // heroku scheduler:
    // scriptL npm run cron -- everttime you run cron it adds the scheduler
    // debugging: heroku logs --ps scheduler

//// @ app.js, save Reminder
//@bot, export seb
