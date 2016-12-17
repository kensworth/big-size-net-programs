const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
// const mongoose = require('mongoose');
// const Submission = mongoose.model('Submission');
// const Program = mongoose.model('Program');
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sqs = new AWS.SQS();

app.use('/admin', require('./admin'));
app.use('/assets', express.static(path.join(__dirname, '/app/assets')));

app.all("*", (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('submission', (data) => {
    var params = {
      DelaySeconds: 10,
      MessageAttributes: {
        "Submission": {
          DataType: "String",
          StringValue: data
        },
      }
      MessageBody: "User Submission",
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
    }
    sqs.sendMessage(params, function(err,data){
      if (err) console.log(err);
      else console.log(data);
    });
    //console.log(data);
  });
});

http.listen(8081, () => {
  console.log('listening on *:8081');
});
