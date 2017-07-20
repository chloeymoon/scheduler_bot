//Cal + Cron
//When click button

//need to know -->
which user, google credentials, subject calendary event, calendar event date

//index.js
//want to update the user object before the confirmation is sent with the description and date of the event
//same idea as pending state

//app.js
//find the user from mongodb
User.findOne({slackId: payload.user.user})
  .then(function(user){
    //need to know -->

    var googleAuth= getGoogleAuth();
    googleAuth.setCredentials(credentials)
    var calendar = google.calendar('v3')
    calendar.events.insert({
      auth: googleAuth,
      calendarId: 'primary',
      resource:{

      }
    })
  })
