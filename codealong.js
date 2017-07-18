User.findOne({slackId: msg.user})
.then(funciton(user){
  if(! user){
    return new User({
      slackId: msg.user,
      slackDmId: msg.channel
    }).save()
  }
  return user;
})
/// inside rtm.on(message), before axios.get



.then(function(user){
  console.log('user is', user);
  rtm.sendMessage('Your id is' + user._id, message.channel);
  if(!user.google){
    rtm.sendMessage('I need access to your Google calender. Please visit http://localhost:3000/connect?user=${user._id} to set up google calender', msg.channel)
  }
  return;
  axios.get('.... params: {}')
})


//autjorozed redirect url:
/callback??? the link above
vliendid & secret: @env.sh


var google = require('googleapis')
var OAuth2 = google.auth.OAuth2;
var {User} = require('./models')

function getGoogleAuth(){
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/connect/callback' // from console.cloud.google.com ;
    //when user finally gives connection, send this
  )
}

const GOOGLE_SCOPES = ['https://www.googpeapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/calender']
// from googleapi

app.get('/connect', function(req,res){
  var userId = req.query.user;
  if(!userId){
    res.redirect(400).send('Missing user id')
  } else {
    User.findById(userId)
    .then(function(user){
      if (! user){
        res.status(404).send('cannot find user')
      } else {
        var googleAuth = getGoogleAuth();
        var url = googleAuth.generageAuthUrl({
          access_type: 'offline',
          prompt: 'consent',
          scope: GOOGLE_SCOPES,
          state: userId
        });
        res.redirect(url);
      }
    })
  }
})


app.get('/connect/callback', function(req, res){
  var googleAuth = getGoogleAuth();
  googleAuth.getToken(req.query.code, function(err, tokens){
    //now tokens contain an access+toke and an optional refresh_token
    if(err){
      res.statue(500).json({error: err});
    } else {
      googleAuth.setCredentials(tokens);
      var plus = google.plus('v1';
    plus.people.get({quth: googleAuth, userId: 'me'}, function(err, googleUser){
      if(err){
        res.status(500).json({error: err})
      } else {
        User.findById(req.query.state)
        .then(function(mongoUser){
          mongoUser.google = tokens;
          mongoUser.google.profile_id = googleUser.id;
          mongoUser.google.profile_name= googleUser.displayName
          return mongoUser.save()
        })
        .then(function(mongoUser){
          res.send('You are connected to google calender')
          rtm.sendMessage('you are connected to google calender', mongoUser, message.channel) //???)
        })
            //  res.json({
            //   code: req.query.code,
            //   state: req.query.state,
            //   tokens, googleUser
            })}
    }))
    }
  })
  // res.json({
  //   code: req.query.code,
  //   state: req.query.state
  })
})
