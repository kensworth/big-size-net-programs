const mongoose = require('mongoose');
const bluebird = require("bluebird");
const Schema = mongoose.Schema;

mongoose.Promise = bluebird;

const { programSchema, submissionSchema } = require("./db.models.js");

mongoose.model('Submission', submissionSchema);
mongoose.model('Program', programSchema);

mongoose.connect('mongodb://localhost/big-size');
