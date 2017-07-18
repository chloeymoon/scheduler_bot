"use strict";
var express = require('express')
var path = require('path')
var app = express()

var hbs = require('express-handlebars')({
  defaultLayout: 'main',
  extname: '.hbs'
});

app.engine('hbs', hbs);
app.set('view engine', 'hbs')

///// requiring botttttttt
require('./bot')
// so app.js requires bot

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
  res.render('index')
})

////figure out /slack/interactive b/c you need to change url on slack website
app.post('slack/interactive', function(req, res){
  var payload = JSON.parse(req.body.payload);
  console.log(payload);
  if(payload.actions[0].value === 'true'){
    res.send('Created reminder! :white_check_mark:');
  } else {
    res.send('Cancelled :x:');
  }
  // tells which button is clicked (if clicked canclled or ok)
})

module.exports = app;
