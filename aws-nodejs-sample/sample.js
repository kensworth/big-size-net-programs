// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
AWS.config.update({region: 'us-east-1'});

var sqs = new AWS.SQS();
// Create an S3 client
var s3 = new AWS.S3();
var params = {
  DelaySeconds: 10, 
  MessageAttributes: {
   "City": {
     DataType: "String", 
     StringValue: "Any City"
    }, 
   "Population": {
     DataType: "Number", 
     StringValue: "1250800"
    }
  }, 
  MessageBody: "Information about the largest city in Any Region.", 
  QueueUrl: "https://sqs.us-east-1.amazonaws.com/542342679377/SubmissionQueue"
 };
 sqs.sendMessage(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    MD5OfMessageAttributes: "00484c68...59e48f06", 
    MD5OfMessageBody: "51b0a325...39163aa0", 
    MessageId: "da68f62c-0c07-4bee-bf5f-7e856EXAMPLE"
   }
   */
 });
// Create a bucket and upload something into it
//var bucketName = 'node-sdk-sample-' + uuid.v4();
//var keyName = 'hello_world.txt';

//s3.createBucket({Bucket: bucketName}, function() {
//  var params = {Bucket: bucketName, Key: keyName, Body: 'Hello World!'};
//  s3.putObject(params, function(err, data) {
//    if (err)
//      console.log(err)
//    else
//      console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
//  });
//});
