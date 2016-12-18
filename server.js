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

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/admin', admin);

app.use('/assets', express.static(path.join(__dirname, '/app/assets')));

app.all("*", (req, res) => {
  console.log("yo");
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

io.on('connection', (socket) => {
  let currentProgram = {};
  Program
  .find()
  .sort({releaseDate:-1})
  .limit(1)
  .then((data) => {
    currentProgram = data[0];
    socket.emit('problem', currentProgram);
  });
  socket.on('submission', (data) => {
    console.log(data, currentProgram);
    const submission = data.code;
    const tests = {
      program_name: currentProgram.title,
      call_signature: "n",
      tests: currentProgram.testCases
    };

    let params = {
      MessageAttributes: {
        "Submission": {
          DataType: "String",
          StringValue: submission,
        },
        "Tests": {
          DataType: "String",
          StringValue: JSON.stringify(tests),
        },
      },
      MessageBody: "User Submission",
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
    };
    sqs.sendMessage(params, function(err,data){
      if (err) console.log(err);
      else console.log(data);
    });
    params = {
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/ReturnQueue"
    };
    sqs.receiveMessage(params,function(err,data){
      if (err)console.log(err);
      else console.log(data);
    });
  });
});

http.listen(8081, () => {
  console.log('listening on *:8081');
});
