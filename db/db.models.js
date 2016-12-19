const mongoose = require('mongoose');
const autoIncrement = require("mongodb-autoincrement");
mongoose.plugin(autoIncrement.mongoosePlugin,{
  field: 'number',
});

const Schema = mongoose.Schema;

const programSchema = new Schema({
  title:String,
  desc: String,
  testCases: Schema.Types.Mixed,
  releaseDate: Date,
  callSignature: String,
  functionName: String,
  timeout: Number,
  number: Number,
});

const submissionSchema = new Schema({
  username: String,
  socket: String,
  program: Schema.Types.ObjectId,
  results: Schema.Types.Mixed,
  code: String,
  time: Number,
});

module.exports = {
  programSchema,
  submissionSchema,
};
