const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const db = require('./db/db.config.js');
const Submission = mongoose.model('Submission');
const Program = mongoose.model('Program');
const admin = require('./admin');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/admin', admin);

app.use('/assets', express.static(path.join(__dirname, '/app/assets')));

app.all("*", (req, res) => {
  console.log("yo");
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

io.on('connection', (socket) => {
  const currentProgram = {};
  Program
  .findOne({})
  .then((data) => {
    const currentProgram = data;
    socket.emit('problem', data);
  });
  socket.on('submission', (data) => {
    console.log(data.code);
    var params = {
      DelaySeconds: 10,
      MessageAttributes: {
        "Submission": {
          DataType: "String",
          StringValue: data.code
        },
      },
      MessageBody: "User Submission",
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
    };
    sqs.sendMessage(params, function(err,data){
      if (err) console.log(err);
      else console.log(data);
    });
  });
});

http.listen(8081, () => {
  console.log('listening on *:8081');
});
