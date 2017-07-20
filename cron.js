"use strict"

console.log('hello im running')
var express = require('express');
var path = require('path');
var cron = express();


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
  var faketoday = new Date()
  console.log('faketoday is', faketoday)
  var realtoday = new Date(faketoday.getTime() - 7 * 60* 60 * 1000)
  console.log('real today is', realtoday)

  var time = new Date().getTime();
  var todaymidnight = new Date(time-time % (24*60*60*1000))
  console.log('todaymidnight', todaymidnight)

  var tomorrow = new Date(realtoday.getTime() + 24 * 60* 60 * 1000)
  // console.log('tomorrow is', tomorrow)
  //2017-07-19T21:49:24.506Z
  var tomorrowmidnight = new Date(todaymidnight.getTime() + 24 * 60* 60 * 1000)
  console.log('tomorrowmidnight', tomorrowmidnight)

  Reminder.find({date: {$gte: todaymidnight, $lte: tomorrowmidnight}}).populate("user")
  .then(function(reminders){
    console.log('REMINDERS:::::::', reminders)
    for (var i = 0; i < reminders.length; i++) {
      if(reminders[i].date.toString() === todaymidnight.toString()){
        console.log('today mightnight reminders', reminders[i].subject)
        rtm.sendMessage("'" + reminders[i].subject+ "' is due today, deleting reminder!", reminders[i].user.slackDmId)
      } else if(reminders[i].date.toString() === tomorrowmidnight.toString()){
        rtm.sendMessage("'" + reminders[i].subject+ "' is due tomorrow!", reminders[i].user.slackDmId)
        console.log('tomorrow mightnight reminders', reminders[i].subject)
      }
    }
    Reminder.remove({date: todaymidnight}, function(err){
      if(err){console.log('ERROR NOT SAVE')}
    })
    return;
  })
  .catch(function(err){
    console.log(err)
  })
});

// User.findOne()
//   .then(function(user){
//     web.chat.postMessage(user.slackDmId,
//       'Currrent itme is ' + new Date()),
//     function(){
//       process.exit(0) // how you kill the script
//       //so after sending the message, it's gonna end
//     })
//   })

rtm.start()

var port = process.env.PORT || 3000;
cron.listen(port)

//@terminal: heroky run npm run cron
// heroku with freqneucy:


//@terminal: heroky run nom run cron
// heroky with freqneucy:
//go to heroku -- app -- overview -- configure add-ons: schedules:
    // heroku scheduler:
    // scriptL npm run cron -- everttime you run cron it adds the scheduler
    // debugging: heroku logs --ps scheduler

//// @ app.js, save Reminder
//@bot, export seb
