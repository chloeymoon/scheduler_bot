"use strict";
var express = require('express');
var path = require('path');
var app = express();
var { User } = require('./models/models')


var mongoose = require('mongoose')
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);
var { User } = require('./models/models')

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


function start() {
  // 2. Initialize the JavaScript client library.
  gapi.client.init({
    'apiKey': process.env.GOOGLE_API_KEY,
    // Your API key will be automatically added to the Discovery Document URLs.
    'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
    // clientId and scope are optional if auth is not required.
    'clientId': process.env.GOOGLE_CLIENT_ID,
    'scope': 'profile',
  }).then(function() {
    // 3. Initialize and make the API request.
    return gapi.client.people.people.get({
      'resourceName': 'people/me',
      'requestMask.includeField': 'person.names'
    });
  }).then(function(response) {
    console.log(response.result);
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });
};
// 1. Load the JavaScript client library.
gapi.load('client', start);







var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
function getGoogleAuth() {
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/connect/callback'
  );
}

const GOOGLE_SCOPE = ['https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/calendar'];

app.get('/connect', function(req,res){
  var userId = req.query.auth_id
  console.log("USERID IS HERE", userId)
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
////figure out /slack/interactive b/c you need to change url on slack website
app.post('/', function(req, res){
  var payload = JSON.parse(req.body.payload);
  if(payload.actions[0].value === 'yes'){
    User.findOne({ slackId: payload.user.id })
    .then(function(user) {
      user.pending.pending = false;
      user.pending.subject= '';
      user.pending.date='';
      return user.save(function(err) {
        if(err) {
          console.log("ERRRORRR")
        }
        //res.send('Created reminder! :white_check_mark:')
      })
    })
    .then(function(user) {
      var event = {
        'summary': 'Google I/O 2015',
        'location': '800 Howard St., San Francisco, CA 94103',
        'description': 'A chance to hear more about Google\'s developer products.',
        'start': {
          'dateTime': '2017-07-19T09:00:00-07:00',
          'timeZone': 'America/Los_Angeles'
        },
        'end': {
          'dateTime': '2017-07-19T17:00:00-07:00',
          'timeZone': 'America/Los_Angeles'
        },
        'recurrence': [
          'RRULE:FREQ=DAILY;COUNT=2'
        ],
        'attendees': [
          {'email': 'lpage@example.com'},
          {'email': 'sbrin@example.com'}
        ],
        'reminders': {
          'useDefault': false,
          'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 10}
          ]
        }
      };

      var request = gapi.client.calendar.events.insert({
        'calendarId': 'primary',
        'resource': event
      });

      request.execute(function(event) {
        appendPre('Event created: ' + event.htmlLink);
      });
      res.send('Created reminder! :white_check_mark:')
    })
  } else {
    res.send('Cancelled :x:');
  }
  // tells which button is clicked (if clicked canclled or ok)
})

var port = process.env.PORT || 3000;
app.listen(port)
// console.log("Express started on port", port)

module.exports = app;
