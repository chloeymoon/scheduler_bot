var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var axios = require('axios')
var { User } = require('./models/models')


var bot_token = process.env.SLACK_BOT_TOKEN || '';

var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token)

let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
	  if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});


//mongoose model: user
// var { User } = require('./models')
// same as var User = require('./models').User

// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
<<<<<<< HEAD
  // rtm.sendMessage("Hello!", channel);
=======
  console.log('connected')
>>>>>>> 5ce8dd539c5499754765e56cbf75ead31b76b653
});



// User.findOne({slackId: msg.user})
// .then(funciton(user){
//   if(! user){
//     return new User({
//       slackId: msg.user,
//       slackDmId: msg.channel
//     }).save()
//   }
//   return user;
// })

rtm.on("message", function(message) {
  console.log(message)
  User.findOne({slackId: message.user})
  .then (function(user){
    if(!user) {
      return new User({
        slackId: message.user,
        slackDmId: message.channel
      }).save()
    }
    return user
  })
<<<<<<< HEAD
  .then(function(response) {
    console.log(response)
    if(response.data.result.actionIncomplete) {
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel)
  } else {
    web.chat.postMessage(message.channel, `Creating reminder for ${response.data.result.parameters.subject} on ${response.data.result.parameters.date}`,
      { 'as_user': true,
        "attachments": [
        {
          "callback_id": "select_simple_1234",
          "fallback": "Upgrade your Slack client to use messages like these.",
          "id": 1,
          "color": "3AA3E3",
          "actions": [
            {
              "id": "1",
              "name": "confirmation",
              "text": "Yes",
              "type": "button",
            },
            {
              "id": "2",
              "name": "confirmation",
              "text": "No",
              "type": "button",
            }
          ]
        }
      ]
    }
  )
}
=======

  .then(function(user) {
    console.log('USER IS', user);
    rtm.sendMessage('Your id is'+ user._id, message.channel)
    axios.get('https://api.api.ai/api/query', {
      headers: {
        "Authorization": `Bearer ${process.env.API_AI_TOKEN}`
      },
      params: {
        v: '20150910',
        lang: 'en',
        timezone: '2017-07-17T16:19:24-0700',
        query: message.text,
        sessionId: message.user
      }
    })
    .then(function(response) {
      console.log(response)
      if(response.data.result.actionIncomplete) {
      rtm.sendMessage(response.data.result.fulfillment.speech, message.channel)
    } else {
      web.chat.postMessage(message.channel, `Create reminder for ${response.data.result.parameters.subject} on ${response.data.result.parameters.date}`,
        { "attachments": [
          {
            "fallback": "Upgrade your Slack client to use messages like these.",
            "callback_id": "confirmation",
            "color": "3AA3E3",
            "actions": [
              {
                "id": "1",
                "name": "confirmation",
                "text": "Yes",
                "type": "button",
                "value": "true"
              },
              {
                "id": "2",
                "name": "confirmation",
                "text": "No",
                "type": "button",
                "value": "false"
              }
            ]
          }
        ]
      }
    )
  }
})
>>>>>>> 5ce8dd539c5499754765e56cbf75ead31b76b653
})
  .catch(function(err) {
    console.log("Error", err.message)
  })
})


rtm.start();

module.exports = {
  rtm
}
