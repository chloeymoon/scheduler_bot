var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var axios = require('axios')

var bot_token = process.env.SLACK_BOT_TOKEN || '';

var rtm = new RtmClient(bot_token);

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
  rtm.sendMessage("Hello!", channel);
});

rtm.on("message", function(message) {
  console.log(message)
  const query = message.text.replace(' ', '%20')
  console.log(query)
  axios.get(`https://api.api.ai/api/query?v=20150910&query=${query}&lang=en&sessionId=f2f27537-7ce4-43ca-9853-9f4ccb957521&timezone=2017-07-17T16:19:24-0700`,
    { headers : {
      "Authorization": "Bearer e919c82598b54f8fa522bf1b2bad61e8"
    }})
  .then(function(response) {
    rtm.sendMessage(response.data.result.fulfillment.speech, message.channel)
  })
  .catch(function(err) {
    console.log("Error")
  })
})


rtm.start();
