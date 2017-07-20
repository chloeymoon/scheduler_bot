var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var axios = require('axios')
var { User } = require('./models/models')
var mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI);
mongoose.Promise = global.Promise;
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token)

  var moment= require('moment')

let channel;
// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
    if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
// you need to wait for the client to fully connect before you can send messages
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  console.log('connected')
});
rtm.on("message", function(message) {
  console.log(message)
  if (message.user) {
    User.findOne({ slackId: message.user })
    .then(function(user){
      if(!user) {
        return new User({
          slackId: message.user,
          slackDmId: message.channel
        }).save()
      }
      return user
    })
    .then(function(user) {
      //AUTHENTICATE GOOGLE ACCOUNT
      if(!user.google) {
        rtm.sendMessage('Knock knock, let me in click this link' +process.env.NGROK_URL+'/connect?auth_id='+user._id, message.channel)
      } else if (user.google.expiry_date < Date.now()) {
        rtm.sendMessage('Knock knock, let me in click this link' +process.env.NGROK_URL+'/connect?auth_id='+user._id, message.channel)
      }
      else {
        var newMessage = message.text
        var slackId = ''
        var slackId2 = ''
        var inviteesArr = []
        while(newMessage.indexOf("<") !== -1) {
          console.log("BEGINNING OF LOOP", newMessage)
          slackId = newMessage.substring(newMessage.indexOf("<"), newMessage.indexOf("<")+12)
          slackId2 = newMessage.substring(newMessage.indexOf("<")+2, newMessage.indexOf("<")+11)
          console.log("THIS IS SLACK ID", slackId, slackId2)
          var userProfile = rtm.dataStore.getUserById(slackId2);
          // console.log("USER IS HERE", user)
          var realName = userProfile.profile.first_name || userProfile.profile.real_name
          newMessage = newMessage.replace(slackId, realName)
          inviteesArr.push({
            slackId: slackId2,
            displayName: realName,
            email: userProfile.profile.email
          })
          console.log("THIS IS NEW MESSAGE", newMessage)
          slackId = ''
          slackId2 = ''
        }

        console.log(inviteesArr)

        axios.get('https://api.api.ai/api/query', {
          headers: {
            "Authorization": `Bearer ${process.env.API_AI_TOKEN}`
          },
          params: {
            v: '20150910',
            lang: 'en',
            timezone: '2017-07-17T16:19:24-0700',
            query: newMessage,
            sessionId: message.user
          }
        })
        .then(function(response) {
          //REMINDER
          if (response.data.result.action === "reminder.add") { ///metadata????
            if(response.data.result.actionIncomplete) {
              rtm.sendMessage(response.data.result.fulfillment.speech, message.channel)
            }
            else if(user.pending && user.pending.pending) {
              rtm.sendMessage("Please choose an option on the previous message to create a new reminder.", message.channel)
            }
            else {
              user.pending.pending = true;
              user.pending.subject = response.data.result.parameters.subject;
              user.pending.date = response.data.result.parameters.date;
              user.pending.time = 'T07:00:00-00:00'
              user.save(function (err) {
                if (err) {
                  console.log("ERROR!!!!")
                } else {
                  web.chat.postMessage(message.channel, `Create reminder for ${response.data.result.parameters.subject} on ${response.data.result.parameters.date}`,
                    { "as_user": "false",
                    "attachments": [
                      {
                        "fallback": "You are unable to choose a game",
                        "callback_id": "confirmation",
                        "color": "#3AA3E3",
                        "attachment_type": "default",
                        "actions": [
                          {
                            "name": "confirmation",
                            "text": "Yes",
                            "type": "button",
                            "value": "yes"
                          },
                          {
                            "name": "confirmation",
                            "text": "No",
                            "type": "button",
                            "value": "no"
                          }
                        ]}
                      ]})
                    }
                  })
                }
              } else {
                //MEETING
                if(response.data.result.actionIncomplete) {
                  rtm.sendMessage(response.data.result.fulfillment.speech, message.channel)
                }
                else if(user.pending.pending) {
                  rtm.sendMessage("Please choose an option on the previous message to create a new meeting.", message.channel)
                }
                else {
                  console.log(moment(response.data.result.parameters.time).add(1, 'hours'))
                  user.pending.pending = true;
                  user.pending.subject = response.data.result.parameters.subject;
                  user.pending.date = response.data.result.parameters.date;
                  user.pending.invitees = response.data.result.parameters.invitees
                  user.pending.time = response.data.result.parameters.time
                  user.pending.endtime = moment(response.data.result.parameters.time).add(1, 'hours')
                  user.save(function (err) {
                    if (err) {
                      console.log("ERROR!!!!")
                    } else {
                      web.chat.postMessage(message.channel, `Create meeting with ${response.data.result.parameters.invitees}
                        for ${response.data.result.parameters.subject} on ${response.data.result.parameters.date} at ${response.data.result.parameters.time}`,
                        { "as_user": "false",
                        "attachments": [
                          {
                            "fallback": "You are unable to choose a game",
                            "callback_id": "confirmation",
                            "color": "#3AA3E3",
                            "attachment_type": "default",
                            "actions": [
                              {
                                "name": "confirmation",
                                "text": "Yes",
                                "type": "button",
                                "value": "yes"
                              },
                              {
                                "name": "confirmation",
                                "text": "No",
                                "type": "button",
                                "value": "no"
                              }
                            ]}
                          ]})
                        }
                      })
                    }
                  }
                })
                .catch(function (err) {
                  console.log("Error11111", err.message)
                })
              }
            })
            .catch(function(err) {
              console.log("Error2222", err.message)
            })
          }
          return;
        })
        rtm.start();
