"use strict"

console.log('hello im running')

var {User} = require('./models')
var {web} = require('./index')


//find all reminders that are due today or tomorrow
Reminder.find({date: {$gt: nowwww, $lt: tomorrow}}) // replace now and tomorrow

User.findOne()
  .then(function(user){
    web.chat.postMessage(user.slackDmId,
      'Currrent itme is ' + new Date(),
    function(){
      process.exit(0) // jhow you kill the script
      //so after sending the message, it's gonna end
    })
  })

//@terminal: heroky run nom run cron
// heroky with freqneucy:
//go to heroku -- app -- overview -- configure add-ons: schedules:
    // heroku scheduler:
    // scriptL npm run cron -- everttime you run cron it adds the scheduler
    // debugging: heroku logs --ps scheduler

//// @ app.js, save Reminder
//@bot, export seb
