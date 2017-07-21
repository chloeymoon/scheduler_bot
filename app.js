"use strict";
var express = require('express');
var path = require('path');
var app = express();
var { User, Reminder } = require('./models/models')


var mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
mongoose.Promise = global.Promise;


var hbs = require('express-handlebars')({
  defaultLayout: 'main',
  extname: '.hbs'
});

app.engine('hbs', hbs);
app.set('view engine', 'hbs')

///// requiring botttttttt
require('./index.js')
// so app.js requires bot

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))


var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
function getGoogleAuth() {
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://safe-coast-18020.herokuapp.com/connect/callback'
  );
}

const GOOGLE_SCOPE = ['https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/calendar'];

app.get('/connect', function(req,res){
  var userId = req.query.auth_id
  if (!userId){
    res.redirect(400).send('Missing user id')
  } else {
    User.findById(userId)
    .then(function(user){
      if(!user){
        res.status(404).send('cannot find user')
      } else {
        var googleAuth = getGoogleAuth()
        var url = googleAuth.generateAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: GOOGLE_SCOPE,
          state: userId
        })
        res.redirect(url)
      }
    })
  }
})

app.get('/connect/callback', function(req,res){
  var googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (err) {
      res.status(500).json({error: err});
    } else {
      googleAuth.setCredentials(tokens);
      var plus = google.plus('v1');
      plus.people.get({ auth: googleAuth, userId: 'me'}, function(err, googleUser) {
        if (err) {
          res.status(500).json({error: err});
        } else {
          User.findById(req.query.state)
          .then(function(mongoUser) {
            mongoUser.google = tokens;
            mongoUser.google.profile_id = googleUser.id;
            mongoUser.google.profile_name = googleUser.displayName;
            return mongoUser.save();
          })
          .then(function(mongoUser) {
            res.send('You are connected to Google Calendar');
          });
        }
      });
    }
  });
})


var moment= require('moment')
////figure out /slack/interactive b/c you need to change url on slack website
app.post('/', function(req, res){
  var payload = JSON.parse(req.body.payload);
  if(payload.actions[0].value === 'yes'){
    //delete date and subject from user
    User.findOne({ slackId: payload.user.id })
    .then(function(user) {
      console.log("USER!!!", user.google)
      var googleAuth = getGoogleAuth()
      var credentials = Object.assign({}, user.google)
      delete credentials.profile_id
      delete credentials.profile_name
      googleAuth.setCredentials(credentials)
      var calendar = google.calendar('v3')

      if (payload.callback_id === "remind") {
      calendar.events.insert({
        auth: googleAuth,
        calendarId: 'primary',
        resource: {
          summary: user.pending.subject,
          start: {
            date: user.pending.date,
            timeZone: 'America/Los_Angeles'
          },
          end: {
            date: moment(user.pending.date).add(1, 'days').format('YYYY-MM-DD'),
            timeZone: 'America/Los_Angeles'
          }
          }
        }, function (err, results) {
          if(err) {
            console.log("ERRROR")
          } else {
            res.send('Created reminder! :white_check_mark:')
            user.pending.pending = false;
            user.pending.subject= '';
            user.pending.date='';
            user.save(function(err) {
              if(err) {
                console.log("ERRRORRR")
              }
              //res.send('Created reminder! :white_check_mark:')
            })
          }
        })
      } else { //MEETINGS
        console.log("TIME IS HERE", user.pending.datetime)
        calendar.events.insert({
          auth: googleAuth,
          calendarId: 'primary',
          resource: {
            summary: user.pending.subject,
            attendees: user.pending.emails,
            start: {
              dateTime: moment.utc(user.pending.datetime).format('YYYY-MM-DDTHH:mm:ss-07:00'),
              'timeZone': 'America/Los_Angeles'
            },
            end: {
              dateTime: moment.utc(user.pending.datetime).add(1,'hours').format('YYYY-MM-DDTHH:mm:ss-07:00'),
              'timeZone': 'America/Los_Angeles'
            }
          }
        }, function (err, results) {
          if(err) {
            console.log("ERRROR")
          } else {
            res.send('Created meeting! :white_check_mark:')
            user.pending.pending = false;
            user.pending.subject= '';
            user.pending.datetime='';
            user.pending.invitees = [];
            user.pending.emails =[]
            user.save(function(err) {
              if(err) {
                console.log("ERRRORRR")
              }
              //res.send('Created reminder! :white_check_mark:')
            })
          }
        })
      }
      return;
    })
    .catch(function(err) {
      if(err) {
        console.log("CATCH ERROR", err)
      }
    })
  } else {
    User.findOne({ slackId: payload.user.id })
    .then(function(user) {
      res.send('Cancelled :x:');
      user.pending = {};
      user.save(function(err) {
        if(err) {
          console.log("ERRRORRR")
        }})
      })
    }
    // tells which button is clicked (if clicked canclled or ok)
  })

  var port = process.env.PORT || 3000;
  app.listen(port)
  // console.log("Express started on port", port)

  module.exports = app;
