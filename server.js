const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const db = require('./db/db.config.js');
const Submission = mongoose.model('Submission');
const Program = mongoose.model('Program');
const admin = require('./admin-api');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const uuid = require('node-uuid');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS();

const __connections = {};
let __currentProgram = {};

app.use(favicon(__dirname + '/app/assets/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/admin', admin);
app.use('/assets', express.static(path.join(__dirname, '/app/assets')));

app.get('/api/scoreboard/recent', (req, res) => {
  if(__currentProgram.number) {
    Submission
    .find({
      program: __currentProgram._id,
      results: {
        success: true,
      },
    })
    .limit(50)
    .then((data) => res.json(data));
  }
});

app.get('/api/scoreboard/:number', (req, res) => {
  Submission
  .find({})
  .then((data) => res.json(data));
});

app.all("*", (req, res) => {
  console.log("yo");
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

io.on('connection', (socket) => {
  let currentProgram = {};
  __connections[socket.id] = socket;
  Program
  .find()
  .sort({releaseDate:-1})
  .limit(1)
  .then((data) => {
    currentProgram = data[0];
    __currentProgram = data[0];
    socket.emit('problem', currentProgram);
  });
  socket.on('submission', (data) => {
    const submission = data.code;
    const username = data.username;
    const programId = data.programId;
    // console.log(programId, ""+currentProgram._id, programId === ""+currentProgram._id);
    if(programId === ""+currentProgram._id) {
      console.log("is current program");
      const tests = {
        program_name: currentProgram.functionName,
        call_signature:currentProgram.callSignature,
        tests: currentProgram.testCases
      };
      sqs.sendMessage({
        MessageAttributes: {
          "Submission": {
            DataType: "String",
            StringValue: submission,
          },
          "Tests": {
            DataType: "String",
            StringValue: JSON.stringify(tests),
          },
          "RequestId":{
            DataType: "String",
            StringValue: socket.id,
          }
        },
        MessageBody: "User Submission",
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
      },
      (err,data) =>{
        if (err) console.log(err);
        else console.log(data);
      });
    } else {
      console.log("is archived program");

      Program
      .findOne({_id: programId})
      .then((_data) => {
        let oldProgram = _data;
        console.log("old",oldProgram);
        const tests = {
          program_name: oldProgram.functionName,
          call_signature:oldProgram.callSignature,
          tests: oldProgram.testCases
        };
        sqs.sendMessage({
          MessageAttributes: {
            "Submission": {
              DataType: "String",
              StringValue: submission,
            },
            "Tests": {
              DataType: "String",
              StringValue: JSON.stringify(tests),
            },
            "RequestId":{
              DataType: "String",
              StringValue: socket.id,
            }
          },
          MessageBody: "User Submission",
          QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
        },
        (err,data) =>{
          if (err) console.log(err);
          else console.log(data);
        });
      });
    }

    sqs.receiveMessage({
      AttributeNames: [
        "All"
      ],
      MessageAttributeNames: [
        "All"
      ],
      QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/ReturnQueue",
      WaitTimeSeconds: 20
    }, (err,data) => {
      if (err)console.log(err);
      else {
        if(data.Messages) {
          data.Messages.map((m) =>{

            const attributes = m.MessageAttributes;
            const responseId = attributes.RequestId.StringValue;
            const receiptHandle = m.ReceiptHandle;
            const success = attributes.Success.StringValue === '1';
            const timeTaken = attributes.TimeTaken.StringValue;
            const failedCase = attributes.FailedCase.StringValue;
            if(responseId === socket.id) {
              console.log("Saving...");
              const s = new Submission({
                username: username,
                program: currentProgram._id,
                results: {success:success},
                time: timeTaken,
                failedCase: failedCase,
                number: 0,
              });
              s.save((data) => {
                socket.emit("results", success, timeTaken, failedCase);
              });
            }
            sqs.deleteMessage({
              QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/ReturnQueue",
              ReceiptHandle: receiptHandle,
            }, (err, data) => {
              if (err) console.log(err, err.stack);
              else  {
                console.log("Message was recieved and deleted.");
              }
            });
          });
        }
      }
    });
  });
});

http.listen(8081, () => {
  console.log('listening on *:8081');
});
